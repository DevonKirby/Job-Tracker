from contextlib import asynccontextmanager
from fastapi import FastAPI
from .database import engine, Base
from .routers import auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Job Tracker API", lifespan=lifespan)

app.include_router(auth.router)