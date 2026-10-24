from datetime import datetime, timedelta
from typing import List
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(prefix="/circle", tags=["The Circle"])

@router.get("/people", response_model=List[schemas.PersonOut])
def get_people(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Person).filter(models.Person.user_id == current_user.id).all()

@router.post("/people", response_model=schemas.PersonOut)
def add_person(
    payload: schemas.PersonCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    person = models.Person(
        user_id=current_user.id,
        name=payload.name.strip(),
        ring=payload.ring,
        note=payload.note,
        last_mentioned=datetime.utcnow()
    )
    db.add(person)
    db.commit()
    db.refresh(person)
    return person

@router.put("/people/{person_id}", response_model=schemas.PersonOut)
def update_person(
    person_id: int,
    payload: schemas.PersonUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    person = (
        db.query(models.Person)
        .filter(models.Person.id == person_id, models.Person.user_id == current_user.id)
        .first()
    )
    if not person:
        raise HTTPException(status_code=404, detail="Person not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(person, field, val)

    db.commit()
    db.refresh(person)
    return person

@router.delete("/people/{person_id}")
def delete_person(
    person_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    person = (
        db.query(models.Person)
        .filter(models.Person.id == person_id, models.Person.user_id == current_user.id)
        .first()
    )
    if not person:
        raise HTTPException(status_code=404, detail="Person not found.")

    db.delete(person)
    db.commit()
    return {"message": "Person removed from Circle."}

@router.get("/nudges", response_model=List[schemas.CircleNudgeOut])
def get_circle_nudges(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    people = db.query(models.Person).filter(models.Person.user_id == current_user.id).all()
    nudges = []

    now = datetime.utcnow()
    for p in people:
        days_since = (now - p.last_mentioned).days if p.last_mentioned else 5
        if days_since >= 3 or not p.last_mentioned:
            sms_text = f"Hey {p.name}! Just thought of you today. Hope you're doing well! ❤️"
            encoded_sms = urllib.parse.quote(sms_text)
            encoded_subject = urllib.parse.quote(f"Checking in on you, {p.name}")
            
            nudges.append(
                schemas.CircleNudgeOut(
                    person_id=p.id,
                    name=p.name,
                    ring=p.ring,
                    reason=f"It's been {days_since} days since you last mentioned {p.name} in your diary.",
                    action_text=f"Send a quick hello to {p.name}",
                    sms_link=f"sms:?&body={encoded_sms}",
                    email_link=f"mailto:?subject={encoded_subject}&body={encoded_sms}"
                )
            )

    return nudges[:4]  # Return top 4 nudges
