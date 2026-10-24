import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app import models

class MemoryService:
    def extract_and_store(self, db: Session, user_id: int, entry_id: int, text: str):
        profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
        if not profile or not profile.remember_enabled:
            return

        lower_text = text.lower()

        # 1. Update Person last_mentioned if existing circle members are mentioned
        people = db.query(models.Person).filter(models.Person.user_id == user_id).all()
        for person in people:
            if re.search(r"\b" + re.escape(person.name.lower()) + r"\b", lower_text):
                person.last_mentioned = datetime.utcnow()
                db.add(person)

        # 2. Extract facts based on keywords (exams, deadlines, interviews, projects, routine)
        facts = []
        if re.search(r"\b(exam|test|viva|quiz|midterm|final)\b", lower_text):
            facts.append(("Academic focus: Preparing for upcoming exams or assessments.", "exam"))
        if re.search(r"\b(deadline|submission|presentation|pitch|client|meeting)\b", lower_text):
            facts.append(("Work / study milestone: Working against pressing deadlines or presentations.", "event"))
        if re.search(r"\b(interview|job|internship|resume|offer|hired)\b", lower_text):
            facts.append(("Career progression: Active with interviews or career opportunities.", "event"))
        if re.search(r"\b(travel|flight|train|trip|vacation|home town|visiting home)\b", lower_text):
            facts.append(("Travel & routine: Planning travel or visiting home.", "routine"))
        if re.search(r"\b(sick|headache|fever|cold|cough|gym|workout|sleep)\b", lower_text):
            facts.append(("Physical wellbeing: Managing health, sleep patterns or workout habits.", "routine"))

        # Save extracted facts if not duplicate
        existing_facts = {
            m.fact_text.lower() for m in db.query(models.MemoryItem).filter(models.MemoryItem.user_id == user_id).all()
        }
        for fact_text, cat in facts:
            if fact_text.lower() not in existing_facts:
                item = models.MemoryItem(
                    user_id=user_id,
                    fact_text=fact_text,
                    category=cat,
                    source_entry_id=entry_id,
                    created_at=datetime.utcnow()
                )
                db.add(item)
        db.commit()

    def get_recent_memories(self, db: Session, user_id: int, limit: int = 8) -> List[str]:
        items = (
            db.query(models.MemoryItem)
            .filter(models.MemoryItem.user_id == user_id)
            .order_by(models.MemoryItem.created_at.desc())
            .limit(limit)
            .all()
        )
        return [item.fact_text for item in items]

memory_service = MemoryService()
