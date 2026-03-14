from datetime import date, timedelta, timezone, datetime
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Application, ApplicationStatus
from ..schemas import DashboardStats, StatusCount, WeeklyCount
from ..auth import get_current_user, User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id

    # --- Total count ---
    total_result = await db.execute(
        select(func.count()).where(Application.user_id == user_id)
        .select_from(Application)
    )
    total = total_result.scalar() or 0

    # --- Count by status ---
    status_result = await db.execute(
        select(Application.status, func.count().label("count"))
        .where(Application.user_id == user_id)
        .group_by(Application.status)
    )
    by_status = [
        StatusCount(status=row.status, count=row.count)
        for row in status_result.all()
    ]

    # --- Response rate ---
    # Responded = anything beyond APPLIED (phone screen, interview, etc)
    responded_statuses = [
        ApplicationStatus.PHONE_SCREEN,
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.OFFER,
        ApplicationStatus.REJECTED
    ]
    responded_result = await db.execute(
        select(func.count())
        .select_from(Application)
        .where(
            Application.user_id == user_id,
            Application.status.in_(responded_statuses)
        )
    )
    responded = responded_result.scalar() or 0
    response_rate = (responded / total * 100) if total > 0 else 0.0

    # --- Interview conversion rate ---
    # Of those who got a response, how many reached interview stage or beyond
    interview_statuses = [
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.OFFER
    ]
    interview_result = await db.execute(
        select(func.count())
        .select_from(Application)
        .where(
            Application.user_id == user_id,
            Application.status.in_(interview_statuses)
        )
    )
    interviews = interview_result.scalar() or 0
    interview_conversion_rate = (interviews / responded * 100) if responded > 0 else 0.0

    # --- Applications per week (last 8 weeks) ---
    eight_weeks_ago = date.today() - timedelta(weeks=8)
    weekly_result = await db.execute(
        select(
            func.date_trunc("week", Application.date_applied).label("week_start"),
            func.count().label("count")
        )
        .where(
            Application.user_id == user_id,
            Application.date_applied >= eight_weeks_ago
        )
        .group_by("week_start")
        .order_by("week_start")
    )
    weekly_counts = [
        WeeklyCount(week_start=row.week_start.date(), count=row.count)
        for row in weekly_result.all()
    ]

    return DashboardStats(
        total=total,
        by_status=by_status,
        response_rate=round(response_rate, 1),
        interview_conversion_rate=round(interview_conversion_rate, 1),
        weekly_counts=weekly_counts
    )