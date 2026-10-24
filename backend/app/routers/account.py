from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.security import get_current_user
from app.services.crypto_service import crypto_service
import json

router = APIRouter(prefix="/account", tags=["Account & Privacy"])

@router.get("/export")
def export_user_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    entries = db.query(models.Entry).filter(models.Entry.user_id == current_user.id).all()
    memories = db.query(models.MemoryItem).filter(models.MemoryItem.user_id == current_user.id).all()
    people = db.query(models.Person).filter(models.Person.user_id == current_user.id).all()
    guardians = db.query(models.Guardian).filter(models.Guardian.user_id == current_user.id).all()

    export_payload = {
        "user": {
            "name": current_user.name,
            "email": current_user.email,
            "age": current_user.age,
            "created_at": current_user.created_at.isoformat()
        },
        "profile": {
            "display_name": profile.display_name if profile else None,
            "default_persona": profile.default_persona if profile else None,
            "support_style": profile.support_style if profile else None,
            "routine": profile.routine_json if profile else None,
            "profile_summary": profile.profile_summary if profile else None
        },
        "entries": [
            {
                "id": e.id,
                "date": e.created_at.isoformat(),
                "mood": e.mood_label,
                "score": e.mood_score,
                "persona": e.persona_used,
                "text": crypto_service.decrypt(e.text_encrypted),
                "replies": [
                    {
                        "role": r.role,
                        "text": crypto_service.decrypt(r.text_encrypted),
                        "persona": r.persona,
                        "created_at": r.created_at.isoformat()
                    }
                    for r in e.replies
                ]
            }
            for e in entries
        ],
        "memories": [
            {"id": m.id, "fact": m.fact_text, "category": m.category, "created_at": m.created_at.isoformat()}
            for m in memories
        ],
        "circle": [
            {"name": p.name, "ring": p.ring, "note": p.note}
            for p in people
        ],
        "guardians": [
            {"name": g.name, "contact": g.contact}
            for g in guardians
        ]
    }

    content = json.dumps(export_payload, indent=2)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=aaina_export_{current_user.name.lower().replace(' ', '_')}.json"}
    )

@router.delete("/data")
def delete_all_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()
    return {"message": "All your data has been permanently and securely deleted."}
