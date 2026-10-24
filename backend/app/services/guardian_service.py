from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app import models

class GuardianService:
    def evaluate(self, db: Session, user: models.User, entry: models.Entry) -> Optional[Dict[str, Any]]:
        # Skip if age >= 16
        if user.age >= 16:
            return None

        guardian = db.query(models.Guardian).filter(models.Guardian.user_id == user.id).first()
        if not guardian:
            return None

        # Check last 24h alert throttle
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        recent_alert = (
            db.query(models.ParentAlert)
            .filter(
                models.ParentAlert.user_id == user.id,
                models.ParentAlert.sent_at >= twenty_four_hours_ago
            )
            .first()
        )
        if recent_alert:
            return None

        # Compute stress signal:
        # 1. Medium or high risk on today's entry
        is_risk_trigger = entry.risk_level in ["medium", "high"]

        # 2. Or >= 3 stressed entries (sad, anxious, angry with score >= 4) in the last 5 days
        five_days_ago = datetime.utcnow() - timedelta(days=5)
        recent_entries = (
            db.query(models.Entry)
            .filter(
                models.Entry.user_id == user.id,
                models.Entry.created_at >= five_days_ago
            )
            .all()
        )
        stressed_count = sum(
            1 for e in recent_entries
            if e.mood_label in ["sad", "anxious", "angry"] and (e.mood_score or 0) >= 4
        )
        is_frequent_stress = stressed_count >= 3

        if not (is_risk_trigger or is_frequent_stress):
            return None

        trigger_reason = "Elevated emotional distress detected" if is_risk_trigger else "Frequent signs of strain or anxiety over recent days"

        # Log parent alert - NEVER storing diary text
        alert = models.ParentAlert(
            user_id=user.id,
            trigger_reason=trigger_reason,
            sent_at=datetime.utcnow(),
            channel="simulated"
        )
        db.add(alert)
        db.commit()

        # Construct parent alert message
        parent_msg = (
            f"Hi {guardian.name}, {user.name}'s Aaina diary suggests they may need some attention "
            f"and care today. Please check in with them kindly and listen first. "
            f"You don't need to ask about what they wrote."
        )

        teen_msg = "I let your parent know you might need some care. You're not in trouble."

        return {
            "alert_triggered": True,
            "parent_name": guardian.name,
            "parent_contact": guardian.contact,
            "message_text": parent_msg,
            "teen_notification": teen_msg
        }

guardian_service = GuardianService()
