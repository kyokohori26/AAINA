import json
import base64
from io import BytesIO
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from PIL import Image
from app.database import get_db
from app import models, schemas
from app.security import get_current_user
from app.config import settings

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.post("/questionnaire", response_model=schemas.ProfileOut)
def save_questionnaire(
    payload: schemas.QuestionnaireInput,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)

    routine_dict = {
        "wake_time": payload.wake_time,
        "sleep_time": payload.sleep_time,
        "work_study_hours": payload.work_study_hours,
        "free_time": payload.free_time
    }

    profile.display_name = payload.display_name or current_user.name.split()[0]
    profile.routine_json = json.dumps(routine_dict)
    profile.personality_tags = ", ".join(payload.personality_tags)
    profile.stresses = payload.stresses
    profile.cheers = payload.cheers
    profile.support_style = payload.support_style
    profile.default_persona = payload.default_persona
    profile.language = payload.language
    profile.reply_length = payload.reply_length

    # Generate profile summary
    summary_parts = [
        f"{profile.display_name} prefers support style '{payload.support_style}' with '{payload.default_persona}' tone.",
        f"Routine: Wakes around {payload.wake_time}, sleeps around {payload.sleep_time}.",
    ]
    if payload.personality_tags:
        summary_parts.append(f"Traits: {', '.join(payload.personality_tags)}.")
    if payload.stresses:
        summary_parts.append(f"Often stressed by: {payload.stresses}.")
    if payload.cheers:
        summary_parts.append(f"Cheered up by: {payload.cheers}.")

    profile.profile_summary = " ".join(summary_parts)

    # Save initial people into Circle
    for p in payload.people:
        if p.name and p.name.strip():
            existing = (
                db.query(models.Person)
                .filter(models.Person.user_id == current_user.id, models.Person.name == p.name.strip())
                .first()
            )
            if not existing:
                person = models.Person(
                    user_id=current_user.id,
                    name=p.name.strip(),
                    ring=p.ring or "close friend",
                    note=p.note,
                    last_mentioned=datetime.utcnow()
                )
                db.add(person)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("", response_model=schemas.ProfileOut)
def get_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        profile = models.Profile(
            user_id=current_user.id,
            display_name=current_user.name.split()[0]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=schemas.ProfileOut)
def update_profile(
    payload: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile

@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    contents = await file.read()
    if len(contents) > 4 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 4MB.")

    try:
        image = Image.open(BytesIO(contents))
        image.thumbnail((600, 600))
        # Save as base64 data URL so it works seamlessly and instantly
        buffered = BytesIO()
        image_format = "PNG" if image.mode == "RGBA" else "JPEG"
        image.save(buffered, format=image_format, quality=85)
        encoded = base64.b64encode(buffered.getvalue()).decode('utf-8')
        data_url = f"data:image/{image_format.lower()};base64,{encoded}"

        profile.photo_path = data_url
        db.commit()
        return {"photo_url": data_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image file.")

@router.delete("/photo")
def delete_photo(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if profile:
        profile.photo_path = None
        db.commit()
    return {"message": "Photo removed."}
