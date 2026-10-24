from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(prefix="/memory", tags=["Memory"])

@router.get("", response_model=List[schemas.MemoryItemOut])
def get_memories(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.MemoryItem)
        .filter(models.MemoryItem.user_id == current_user.id)
        .order_by(models.MemoryItem.created_at.desc())
        .all()
    )

@router.delete("/{memory_id}")
def delete_memory(
    memory_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = (
        db.query(models.MemoryItem)
        .filter(models.MemoryItem.id == memory_id, models.MemoryItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Memory item not found.")

    db.delete(item)
    db.commit()
    return {"message": "Memory item deleted."}
