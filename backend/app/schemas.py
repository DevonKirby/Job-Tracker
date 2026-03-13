import uuid
from datetime import datetime, date
from pydantic import BaseModel, EmailStr
from .models import ApplicationStatus

# --- Auth ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Applications ---

class ApplicationCreate(BaseModel):
    company: str
    role: str
    location: str | None = None
    url: str | None = None
    status: ApplicationStatus = ApplicationStatus.APPLIED
    date_applied: date
    follow_up_date: date | None = None
    notes: str | None = None

class ApplicationUpdate(BaseModel):
    company: str | None = None
    role: str | None = None
    location: str | None = None
    url: str | None = None
    status: ApplicationStatus | None = None
    date_applied: date | None = None
    follow_up_date: date | None = None
    notes: str | None = None


class ApplicationOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    company: str
    role: str
    location: str | None
    url: str | None
    status: ApplicationStatus
    date_applied: date
    follow_up_date: date | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# --- Notifications ---

class NotificationOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    application_id: uuid.UUID
    message: str
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}

# --- Dashboard ---

class StatusCount(BaseModel):
    status: ApplicationStatus
    count: int

class WeeklyCount(BaseModel):
    week_start: date
    count: int

class DashboardStats(BaseModel):
    total: int
    by_status: list[StatusCount]
    response_rate: float
    interview_conversion_rate: float
    weekly_counts: list[WeeklyCount]