from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(prefix="/alerts", tags=["Parent Alerts"])

@router.get("/history", response_model=List[schemas.ParentAlertOut])
def get_alert_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.ParentAlert)
        .filter(models.ParentAlert.user_id == current_user.id)
        .order_by(models.ParentAlert.sent_at.desc())
        .all()
    )

@router.get("/demo-view")
def get_parent_demo_view(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Public/demo endpoint for showing the simulated parent phone/screen (#/parent-demo)
    without exposing any confidential diary text!
    """
    query = db.query(models.ParentAlert).order_by(models.ParentAlert.sent_at.desc())
    if user_id:
        query = query.filter(models.ParentAlert.user_id == user_id)
    
    latest_alert = query.first()
    if not latest_alert:
        # Default fallback sample alert if none sent yet
        return {
            "has_alert": True,
            "child_name": "Aarav",
            "parent_name": "Pooja",
            "sent_at": "Today, 4:15 PM",
            "message": "Hi Pooja, Aarav's Aaina diary suggests they may need some attention and care today. Please check in with them kindly and listen first. You don't need to ask about what they wrote.",
            "guide_tips": [
                "Start with warmth: 'Hey, just checking in. How was your day?'",
                "Listen without offering quick fixes or interrogating them.",
                "Offer a comforting snack, drink, or quiet companionship.",
                "Remember: Aaina protects their private words so they can continue to safely reflect."
            ]
        }

    user = db.query(models.User).filter(models.User.id == latest_alert.user_id).first()
    guardian = db.query(models.Guardian).filter(models.Guardian.user_id == latest_alert.user_id).first()
    child_name = user.name if user else "Your Child"
    parent_name = guardian.name if guardian else "Parent"

    return {
        "has_alert": True,
        "child_name": child_name,
        "parent_name": parent_name,
        "sent_at": latest_alert.sent_at.strftime("%B %d, %I:%M %p"),
        "message": f"Hi {parent_name}, {child_name}'s Aaina diary suggests they may need some attention and care today. Please check in with them kindly and listen first. You don't need to ask about what they wrote.",
        "guide_tips": [
            "Start with warmth: 'Hey, just checking in. How was your day?'",
            "Listen without offering quick fixes or interrogating them.",
            "Offer a comforting snack, drink, or quiet companionship.",
            "Remember: Aaina protects their private words so they can continue to safely reflect."
        ]
    }
