# Job Application Tracker

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Auth | JWT (OAuth2 password flow) |

---

## Data Models

### User
```
id               UUID, primary key
email            string, unique
hashed_password  string
created_at       timestamp
```

### Application
```
id               UUID, primary key
user_id          UUID, foreign key → User
company          string
role             string
location         string (optional)
url              string (optional)
status           enum: APPLIED, PHONE_SCREEN, INTERVIEW, OFFER, REJECTED, WITHDRAWN
date_applied     date
follow_up_date   date (optional)
notes            text (optional)
created_at       timestamp
updated_at       timestamp
```

### Notification
```
id               UUID, primary key
user_id          UUID, foreign key → User
application_id   UUID, foreign key → Application
message          string
read             boolean, default false
created_at       timestamp
```

---

## API Endpoints

### Auth
```
POST   /auth/register        Register a new user
POST   /auth/token           Login, returns JWT access token
GET    /auth/me              Get current authenticated user
```

### Applications
```
GET    /applications         List all applications for current user
POST   /applications         Create a new application
GET    /applications/{id}    Get a single application
PUT    /applications/{id}    Update an application
DELETE /applications/{id}    Delete an application
```

### Dashboard
```
GET    /dashboard/stats      Returns aggregate stats:
                             - total applications
                             - applications by status
                             - response rate
                             - interview conversion rate
                             - applications per week (last 8 weeks)
```

### Notifications
```
GET    /notifications        List unread notifications for current user
PUT    /notifications/{id}/read   Mark a notification as read
DELETE /notifications/clear  Clear all notifications
```

---

## Authentication Flow

1. User registers or logs in via `/auth/token`
2. Backend returns a JWT access token
3. Frontend stores token in memory (not localStorage)
4. All protected API requests include `Authorization: Bearer <token>` header

---

## Key Libraries

### Backend
```
fastapi                     # Web framework
uvicorn[standard]           # Web server
sqlalchemy[asyncio]         # Object-Relational Mapping
asyncpg                     # PostgreSQL async driver
pydantic[email]             # Data validation
python-jose[cryptography]   # JWT
passlib[bcrypt]             # Password hashing
bcrypt=3.2.2                # Specific version for compatibility
apscheduler                 # Follow-up date background job
python-multipart            # Required for parsing application/x-www-form-urlencoded request bodies
```

---

## Environment Variables

```
# Backend
DATABASE_URL=postgresql+asyncpg://user:password@db:5432/jobtracker
SECRET_KEY=your-jwt-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
