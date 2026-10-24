from datetime import datetime, timedelta, time
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app import models

class NudgeService:
    def check_inactivity_nudge(self, db: Session, user: models.User) -> Optional[models.Nudge]:
        profile = db.query(models.Profile).filter(models.Profile.user_id == user.id).first()
        if not profile or not profile.nudges_enabled:
            return None

        # Check quiet hours
        now = datetime.now()
        current_time_str = now.strftime("%H:%M")
        start = profile.nudge_quiet_start or "22:00"
        end = profile.nudge_quiet_end or "08:00"
        if start > end:  # overnight quiet hours, e.g. 22:00 to 08:00
            if current_time_str >= start or current_time_str <= end:
                return None
        else:
            if start <= current_time_str <= end:
                return None

        # Check last entry date
        last_entry = (
            db.query(models.Entry)
            .filter(models.Entry.user_id == user.id)
            .order_by(models.Entry.created_at.desc())
            .first()
        )

        last_entry_time = last_entry.created_at if last_entry else user.created_at
        days_inactive = (datetime.utcnow() - last_entry_time).days

        if days_inactive < 2:
            return None

        # Check nudges sent in the last 24h
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        recent_nudge = (
            db.query(models.Nudge)
            .filter(models.Nudge.user_id == user.id, models.Nudge.sent_at >= one_day_ago)
            .first()
        )
        if recent_nudge:
            return None

        # Check unanswered nudges count (max 3 without opening or writing)
        unopened_count = (
            db.query(models.Nudge)
            .filter(models.Nudge.user_id == user.id, models.Nudge.opened == False)
            .count()
        )
        if unopened_count >= 3:
            return None

        name = profile.display_name or user.name

        if days_inactive >= 7:
            nudge_type = "7_day"
            msg = f"Missing our chats, {name}. Whenever you're ready, I'm here. No pressure."
        elif days_inactive >= 4:
            nudge_type = "4_day"
            msg = f"We haven't talked in a few days, {name}. Are you okay?"
        else:
            nudge_type = "2_day"
            msg = f"Hey {name}, how was your day? Aaina is here whenever you want to talk."

        nudge = models.Nudge(
            user_id=user.id,
            type=nudge_type,
            message=msg,
            sent_at=datetime.utcnow(),
            opened=False
        )
        db.add(nudge)
        db.commit()
        db.refresh(nudge)
        return nudge

    def simulate_nudge(self, db: Session, user: models.User, days_ago: int = 4) -> models.Nudge:
        profile = db.query(models.Profile).filter(models.Profile.user_id == user.id).first()
        name = (profile.display_name if profile else None) or user.name

        if days_ago >= 7:
            msg = f"Missing our chats, {name}. Whenever you're ready, I'm here. No pressure."
            ntype = "7_day"
        elif days_ago >= 4:
            msg = f"We haven't talked in a few days, {name}. Are you okay?"
            ntype = "4_day"
        else:
            msg = f"Hey {name}, how was your day? Aaina is here whenever you want to talk."
            ntype = "2_day"

        nudge = models.Nudge(
            user_id=user.id,
            type=ntype,
            message=msg,
            sent_at=datetime.utcnow(),
            opened=False
        )
        db.add(nudge)
        db.commit()
        db.refresh(nudge)
        return nudge

nudge_service = NudgeService()
