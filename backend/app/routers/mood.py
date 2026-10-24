from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.security import get_current_user
from app.services.mood_service import mood_service

router = APIRouter(prefix="/mood", tags=["Mood Analytics"])

@router.get("/summary", response_model=schemas.MoodSummaryResponse)
def get_mood_summary(
    range: str = Query("week", pattern="^(week|month)$"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return mood_service.get_summary(db, current_user.id, time_range=range)
