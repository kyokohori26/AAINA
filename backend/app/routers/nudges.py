from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.security import get_current_user
from app.services.nudge_service import nudge_service

router = APIRouter(prefix="/nudges", tags=["Check-in Nudges"])

@router.get("/pending", response_model=Optional[schemas.NudgeOut])
def get_pending_nudge(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if there is an existing unopened nudge
    existing = (
        db.query(models.Nudge)
        .filter(models.Nudge.user_id == current_user.id, models.Nudge.opened == False)
        .order_by(models.Nudge.sent_at.desc())
        .first()
    )
    if existing:
        return existing

    # Otherwise evaluate inactivity
    return nudge_service.check_inactivity_nudge(db, current_user)

@router.post("/{nudge_id}/dismiss")
def dismiss_nudge(
    nudge_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    nudge = (
        db.query(models.Nudge)
        .filter(models.Nudge.id == nudge_id, models.Nudge.user_id == current_user.id)
        .first()
    )
    if nudge:
        nudge.opened = True
        db.commit()
    return {"message": "Nudge dismissed."}

@router.post("/simulate", response_model=schemas.NudgeOut)
def simulate_nudge(
    payload: schemas.SimulateNudgeRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Demo helper: instantly creates a friendly inactivity check-in nudge for presentation testing."""
    return nudge_service.simulate_nudge(db, current_user, days_ago=payload.days_ago)
