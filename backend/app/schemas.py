from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# --- Auth ---
class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    age: int = Field(..., ge=1, le=120)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    age: int
    created_at: datetime
    has_profile: bool = False
    needs_parent_link: bool = False

    class Config:
        from_attributes = True


# --- Profile & Questionnaire ---
class RoutineData(BaseModel):
    wake_time: Optional[str] = "07:30"
    sleep_time: Optional[str] = "23:30"
    work_study_hours: Optional[str] = "09:00 - 17:00"
    free_time: Optional[str] = "Evenings"

class PersonInitial(BaseModel):
    name: str
    ring: str = "close friend"  # "close friend", "family", "colleague"
    note: Optional[str] = None

class QuestionnaireInput(BaseModel):
    display_name: Optional[str] = None
    wake_time: Optional[str] = "07:30"
    sleep_time: Optional[str] = "23:30"
    work_study_hours: Optional[str] = "09:00 - 17:00"
    free_time: Optional[str] = "Evenings"
    personality_tags: List[str] = []
    stresses: Optional[str] = None
    cheers: Optional[str] = None
    support_style: str = "comfort"  # comfort, advice, humour, motivation
    default_persona: str = "best_friend"
    people: List[PersonInitial] = []
    language: str = "english"
    reply_length: str = "medium"

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    default_persona: Optional[str] = None
    support_style: Optional[str] = None
    reply_length: Optional[str] = None
    language: Optional[str] = None
    remember_enabled: Optional[bool] = None
    nudges_enabled: Optional[bool] = None
    nudge_quiet_start: Optional[str] = None
    nudge_quiet_end: Optional[str] = None
    music_choice: Optional[str] = None
    music_volume: Optional[float] = None
    routine_json: Optional[str] = None
    personality_tags: Optional[str] = None
    stresses: Optional[str] = None
    cheers: Optional[str] = None

class ProfileOut(BaseModel):
    user_id: int
    display_name: Optional[str]
    routine_json: Optional[str]
    personality_tags: Optional[str]
    stresses: Optional[str]
    cheers: Optional[str]
    support_style: str
    default_persona: str
    reply_length: str
    language: str
    profile_summary: Optional[str]
    remember_enabled: bool
    photo_path: Optional[str]
    nudges_enabled: bool
    nudge_quiet_start: str
    nudge_quiet_end: str
    music_choice: str
    music_volume: float

    class Config:
        from_attributes = True


# --- Diary & AI Replies ---
class ReplyOut(BaseModel):
    id: int
    entry_id: int
    role: str
    text: str
    persona: str
    helpful_flag: Optional[bool] = None
    created_at: datetime
    ai_provider: Optional[str] = "gemma"
    ai_fallback: Optional[bool] = False

    class Config:
        from_attributes = True

class ReplyCreate(BaseModel):
    text: str
    persona: Optional[str] = None

class EntryCreate(BaseModel):
    text: str = Field(..., min_length=1)
    persona: Optional[str] = "best_friend"
    mode: Optional[str] = "listen"  # "listen" or "advice"
    mood: Optional[str] = None
    photo_base64: Optional[str] = None

class RegenerateRequest(BaseModel):
    persona: str

class FeedbackRequest(BaseModel):
    helpful: bool

class SafetyCrisisPayload(BaseModel):
    is_crisis: bool = True
    level: str = "high"
    support_message: str
    helpline_name: str = "Tele-MANAS (Government of India)"
    helpline_number: str = "14416"
    alternate_helpline: str = "Vandrevala Foundation: +91 9999 666 555"
    international_info: str = "In the US/Canada: 988. In the UK: 111. Please reach out to someone you trust."

class ParentAlertModalPayload(BaseModel):
    alert_triggered: bool = False
    parent_name: Optional[str] = None
    parent_contact: Optional[str] = None
    message_text: Optional[str] = None
    teen_notification: Optional[str] = None

class EntryOut(BaseModel):
    id: int
    user_id: int
    text: str
    mood_label: str
    mood_score: int
    persona_used: str
    mode: str
    risk_level: str
    created_at: datetime
    photo_thumbnail: Optional[str] = None
    ai_provider: Optional[str] = "gemma"
    ai_fallback: Optional[bool] = False
    replies: List[ReplyOut] = []
    parent_alert: Optional[ParentAlertModalPayload] = None
    crisis_payload: Optional[SafetyCrisisPayload] = None

    class Config:
        from_attributes = True

class EntrySummaryOut(BaseModel):
    id: int
    date: str
    preview: str
    full_text: str
    mood_label: str
    mood_score: int
    persona_used: str
    created_at: datetime
    photo_thumbnail: Optional[str] = None
    latest_reply: Optional[ReplyOut] = None
    reply_count: int = 0


# --- Mood Timeline & Analytics ---
class MoodSummaryItem(BaseModel):
    date: str
    day_name: str
    mood_label: str
    mood_score: int
    count: int

class MoodHeatmapDay(BaseModel):
    date: str
    mood_label: Optional[str] = None
    score: Optional[int] = None
    has_entry: bool = False

class MoodInsight(BaseModel):
    title: str
    description: str
    type: str = "pattern"  # pattern, cheer, suggestion

class MoodSummaryResponse(BaseModel):
    range: str
    timeline: List[MoodSummaryItem]
    heatmap: List[MoodHeatmapDay]
    insights: List[MoodInsight]
    dominant_mood: str
    total_entries: int


# --- The Circle ---
class PersonCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    ring: str = Field(..., pattern="^(close friend|family|colleague)$")
    note: Optional[str] = None

class PersonUpdate(BaseModel):
    name: Optional[str] = None
    ring: Optional[str] = None
    note: Optional[str] = None

class PersonOut(BaseModel):
    id: int
    name: str
    ring: str
    note: Optional[str]
    last_mentioned: Optional[datetime]

    class Config:
        from_attributes = True

class CircleNudgeOut(BaseModel):
    person_id: int
    name: str
    ring: str
    reason: str
    action_text: str
    sms_link: str
    email_link: str


# --- Memory Items ---
class MemoryItemOut(BaseModel):
    id: int
    fact_text: str
    category: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Guardians & Alerts ---
class GuardianCreate(BaseModel):
    name: str
    contact: str

class GuardianOut(BaseModel):
    id: int
    user_id: int
    name: str
    contact: str
    consent_confirmed_at: Optional[datetime]

    class Config:
        from_attributes = True

class ParentAlertOut(BaseModel):
    id: int
    trigger_reason: str
    sent_at: datetime
    channel: str

    class Config:
        from_attributes = True


# --- Nudges ---
class NudgeOut(BaseModel):
    id: int
    type: str
    message: str
    sent_at: datetime
    opened: bool

    class Config:
        from_attributes = True

class SimulateNudgeRequest(BaseModel):
    days_ago: int = 4
