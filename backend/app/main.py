import time
from collections import defaultdict
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
from app import models

import sqlalchemy as sa

# Create database tables
Base.metadata.create_all(bind=engine)

# Safe SQLite auto-migration for newly added columns
def auto_migrate():
    try:
        with engine.begin() as conn:
            result = conn.execute(sa.text("PRAGMA table_info(entries)")).fetchall()
            col_names = [r[1] for r in result]
            if col_names:
                if "photo_thumbnail" not in col_names:
                    conn.execute(sa.text("ALTER TABLE entries ADD COLUMN photo_thumbnail TEXT"))
                if "ai_provider" not in col_names:
                    conn.execute(sa.text("ALTER TABLE entries ADD COLUMN ai_provider VARCHAR(50) DEFAULT 'gemma'"))
                if "ai_fallback" not in col_names:
                    conn.execute(sa.text("ALTER TABLE entries ADD COLUMN ai_fallback BOOLEAN DEFAULT 0"))

            res_rep = conn.execute(sa.text("PRAGMA table_info(replies)")).fetchall()
            rep_col_names = [r[1] for r in res_rep]
            if rep_col_names:
                if "ai_provider" not in rep_col_names:
                    conn.execute(sa.text("ALTER TABLE replies ADD COLUMN ai_provider VARCHAR(50) DEFAULT 'gemma'"))
                if "ai_fallback" not in rep_col_names:
                    conn.execute(sa.text("ALTER TABLE replies ADD COLUMN ai_fallback BOOLEAN DEFAULT 0"))
    except Exception as e:
        print(f"[AUTO-MIGRATE] Warning during table migration: {e}")

auto_migrate()

app = FastAPI(
    title="Aaina API",
    description="Backend API for Aaina - An AI diary companion that listens, remembers, and replies like someone who knows you.",
    version="2.0.0"
)

# CORS setup
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open in development for local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory rate limiting for diary entries (20 entries / min)
RATE_LIMIT_STORE = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path == "/api/diary/entries" and request.method == "POST":
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        # Clean timestamps older than 60 seconds
        RATE_LIMIT_STORE[client_ip] = [t for t in RATE_LIMIT_STORE[client_ip] if now - t < 60]
        if len(RATE_LIMIT_STORE[client_ip]) >= 20:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many diary entries submitted. Please pause for a moment to reflect."}
            )
        RATE_LIMIT_STORE[client_ip].append(now)

    response = await call_next(request)
    return response

# Import routers
from app.routers import auth, profile, diary, mood, circle, memory, account, guardians, alerts, nudges

app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(diary.router, prefix="/api")
app.include_router(mood.router, prefix="/api")
app.include_router(circle.router, prefix="/api")
app.include_router(memory.router, prefix="/api")
app.include_router(account.router, prefix="/api")
app.include_router(guardians.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(nudges.router, prefix="/api")

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "app": "Aaina API",
        "version": "2.0.0",
        "llm_provider": settings.LLM_PROVIDER
    }
