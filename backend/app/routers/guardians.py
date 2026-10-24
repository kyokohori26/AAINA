from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(prefix="/guardians", tags=["Family Care Link"])

@router.get("", response_model=List[schemas.GuardianOut])
def get_guardians(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Guardian).filter(models.Guardian.user_id == current_user.id).all()

@router.post("", response_model=schemas.GuardianOut)
def add_guardian(
    payload: schemas.GuardianCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if one already exists, update or replace
    existing = db.query(models.Guardian).filter(models.Guardian.user_id == current_user.id).first()
    if existing:
        existing.name = payload.name
        existing.contact = payload.contact
        existing.consent_confirmed_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    guardian = models.Guardian(
        user_id=current_user.id,
        name=payload.name,
        contact=payload.contact,
        consent_confirmed_at=datetime.utcnow()
    )
    db.add(guardian)
    db.commit()
    db.refresh(guardian)
    return guardian

@router.delete("/{guardian_id}")
def delete_guardian(
    guardian_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    guardian = (
        db.query(models.Guardian)
        .filter(models.Guardian.id == guardian_id, models.Guardian.user_id == current_user.id)
        .first()
    )
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found.")

    db.delete(guardian)
    db.commit()
    return {"message": "Guardian contact removed."}
