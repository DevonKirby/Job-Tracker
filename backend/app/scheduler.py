import logging
from datetime import date, timezone, datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .database import AsyncSessionLocal
from .models import Application, Notification
from .websocket import manager

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def check_follow_ups():
    logger.info("Running follow-up check...")
    today = date.today()

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Application).where(Application.follow_up_date == today)
        )
    applications = result.scalars().all()

    for application in applications:
        # Create notification in DB
        notification = Notification(
            user_id=application.user_id,
            application_id=application.id,
            message=f"Follow-up reminder: {application.role} at {application.company}"
        )
        db.add(notification)
        await db.flush()    # get notification.id without committing

        # Push over WebSocket if user is connected
        await manager.send_to_user(
            application.user_id,
            {
                "id": str(notification.id),
                "application_id": str(application.id),
                "message": notification.message,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        )

        await db.commit()
        logger.info(f"Follow-up check complete. Processed {len(applications)} applications.")

def start_scheduler():
    scheduler.add_job(
        check_follow_ups,
        CronTrigger(hour=9, minute=0),  #runs daily at 9am
        id="follow_up_check",
        replace_existing=True
    )
    scheduler.start()