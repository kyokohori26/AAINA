import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app import models
from app.services.crypto_service import crypto_service

class MoodService:
    def __init__(self):
        self.lexicon = {
            "happy": {
                "words": ["happy", "joy", "excited", "great", "wonderful", "amazing", "grateful", "smile", "laughed", "proud", "love", "awesome", "khush", "sukoon", "mast", "fun", "celebrated"],
                "base_score": 4
            },
            "calm": {
                "words": ["peace", "calm", "relax", "quiet", "breathe", "content", "balanced", "settled", "relief", "soothing", "peaceful", "shanti", "chilled"],
                "base_score": 3
            },
            "anxious": {
                "words": ["anxious", "nervous", "worried", "stress", "panic", "overwhelmed", "scared", "fear", "exam", "deadline", "presentation", "interview", "tension", "frightened", "darr"],
                "base_score": 4
            },
            "sad": {
                "words": ["sad", "alone", "crying", "tears", "lonely", "hurt", "heartbroken", "gloomy", "down", "miss", "missed", "dukhi", "rona", "udaas"],
                "base_score": 4
            },
            "angry": {
                "words": ["angry", "mad", "furious", "annoyed", "frustrated", "irritated", "hate", "unfair", "gussa", "disgusted"],
                "base_score": 4
            },
            "tired": {
                "words": ["tired", "exhausted", "drained", "sleepy", "fatigue", "burnt out", "burnout", "no energy", "thak", "heavy eyes"],
                "base_score": 3
            }
        }

    def detect_mood(self, text: str, explicit_mood: Optional[str] = None) -> Tuple[str, int]:
        if explicit_mood and explicit_mood.lower() in ["calm", "happy", "sad", "anxious", "angry", "tired", "neutral"]:
            # User explicitly selected this mood
            return explicit_mood.lower(), 4

        if not text:
            return "neutral", 3

        lower = text.lower()
        counts = {m: 0 for m in self.lexicon}
        for mood, data in self.lexicon.items():
            for word in data["words"]:
                if re.search(r"\b" + re.escape(word) + r"\b", lower):
                    counts[mood] += 1

        best_mood = max(counts, key=counts.get)
        if counts[best_mood] > 0:
            score = min(5, self.lexicon[best_mood]["base_score"] + (1 if counts[best_mood] > 2 else 0))
            return best_mood, score

        return "neutral", 3

    def get_summary(self, db: Session, user_id: int, time_range: str = "week") -> Dict[str, Any]:
        now = datetime.utcnow()
        days_back = 7 if time_range == "week" else 30
        start_date = now - timedelta(days=days_back)

        entries = (
            db.query(models.Entry)
            .filter(models.Entry.user_id == user_id, models.Entry.created_at >= start_date)
            .order_by(models.Entry.created_at.asc())
            .all()
        )

        # Build timeline
        timeline_dict = {}
        for i in range(days_back):
            d = (now - timedelta(days=days_back - 1 - i)).date()
            d_str = d.strftime("%Y-%m-%d")
            timeline_dict[d_str] = {
                "date": d_str,
                "day_name": d.strftime("%a"),
                "entries": []
            }

        for e in entries:
            d_str = e.created_at.date().strftime("%Y-%m-%d")
            if d_str in timeline_dict:
                timeline_dict[d_str]["entries"].append(e)

        timeline = []
        mood_frequencies = {}
        for d_str, day_data in timeline_dict.items():
            day_entries = day_data["entries"]
            if day_entries:
                # Get the latest entry's mood
                latest = day_entries[-1]
                mood_label = latest.mood_label
                mood_score = latest.mood_score
                count = len(day_entries)
                mood_frequencies[mood_label] = mood_frequencies.get(mood_label, 0) + 1
            else:
                mood_label = "none"
                mood_score = 0
                count = 0

            timeline.append({
                "date": d_str,
                "day_name": day_data["day_name"],
                "mood_label": mood_label,
                "mood_score": mood_score,
                "count": count
            })

        # Build heatmap (30 days)
        heatmap = []
        for i in range(30):
            d = (now - timedelta(days=29 - i)).date()
            d_str = d.strftime("%Y-%m-%d")
            day_entries = [e for e in entries if e.created_at.date() == d]
            if day_entries:
                heatmap.append({
                    "date": d_str,
                    "mood_label": day_entries[-1].mood_label,
                    "score": day_entries[-1].mood_score,
                    "has_entry": True
                })
            else:
                heatmap.append({
                    "date": d_str,
                    "mood_label": None,
                    "score": None,
                    "has_entry": False
                })

        # Determine dominant mood
        if mood_frequencies:
            dominant_mood = max(mood_frequencies, key=mood_frequencies.get)
        else:
            dominant_mood = "calm"

        # Generate Insights
        insights = []
        if len(entries) == 0:
            insights.append({
                "title": "Welcome to your reflection space",
                "description": "As you write daily, Aaina will identify your natural emotional rhythms and patterns.",
                "type": "suggestion"
            })
        else:
            if dominant_mood in ["happy", "calm"]:
                insights.append({
                    "title": f"Mostly feeling {dominant_mood.capitalize()}",
                    "description": f"You've shown strong emotional balance with {dominant_mood} feelings leading your days.",
                    "type": "cheer"
                })
            elif dominant_mood in ["anxious", "sad", "tired"]:
                insights.append({
                    "title": f"Noticing recurring {dominant_mood} moments",
                    "description": f"You've carried extra weight lately. Remember to take gentle breathers and protect your resting time.",
                    "type": "pattern"
                })

            # Day of week pattern
            insights.append({
                "title": "Evening Reflections",
                "description": "Writing down your thoughts helps clear mental fog before sleep. You've shown up for yourself consistently.",
                "type": "pattern"
            })

            insights.append({
                "title": "A Gentle Reminder",
                "description": "Every feeling has a reason. Even on hard days, putting your words into the mirror helps bring clarity.",
                "type": "suggestion"
            })

        return {
            "range": time_range,
            "timeline": timeline,
            "heatmap": heatmap,
            "insights": insights,
            "dominant_mood": dominant_mood,
            "total_entries": len(entries)
        }
mood_service = MoodService()
