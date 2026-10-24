from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False, default=18)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    entries = relationship("Entry", back_populates="user", cascade="all, delete-orphan")
    memory_items = relationship("MemoryItem", back_populates="user", cascade="all, delete-orphan")
    people = relationship("Person", back_populates="user", cascade="all, delete-orphan")
    guardians = relationship("Guardian", back_populates="user", cascade="all, delete-orphan")
    parent_alerts = relationship("ParentAlert", back_populates="user", cascade="all, delete-orphan")
    nudges = relationship("Nudge", back_populates="user", cascade="all, delete-orphan")
    safety_events = relationship("SafetyEvent", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    display_name = Column(String(100), nullable=True)
    routine_json = Column(Text, nullable=True)  # JSON string
    personality_tags = Column(String(255), nullable=True)  # comma separated
    stresses = Column(Text, nullable=True)
    cheers = Column(Text, nullable=True)
    support_style = Column(String(50), default="comfort")  # comfort, advice, humour, motivation
    default_persona = Column(String(50), default="best_friend")  # caring_mom, wise_dad, best_friend, partner, mentor
    reply_length = Column(String(20), default="medium")  # short, medium
    language = Column(String(20), default="english")  # english, hinglish
    profile_summary = Column(Text, nullable=True)
    remember_enabled = Column(Boolean, default=True)
    photo_path = Column(String(500), nullable=True)
    nudges_enabled = Column(Boolean, default=True)
    nudge_quiet_start = Column(String(10), default="22:00")
    nudge_quiet_end = Column(String(10), default="08:00")
    music_choice = Column(String(50), default="off")
    music_volume = Column(Float, default=0.20)

    user = relationship("User", back_populates="profile")


class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    text_encrypted = Column(Text, nullable=False)
    mood_label = Column(String(30), default="neutral")  # calm, happy, sad, anxious, angry, tired, neutral
    mood_score = Column(Integer, default=3)  # 1 to 5
    persona_used = Column(String(50), default="best_friend")
    mode = Column(String(20), default="listen")  # listen, advice
    risk_level = Column(String(20), default="low")  # low, medium, high
    photo_thumbnail = Column(Text, nullable=True)  # Lightweight data URL or thumbnail for UI
    ai_provider = Column(String(50), default="gemma")  # gemma, mock, anthropic
    ai_fallback = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="entries")
    replies = relationship("Reply", back_populates="entry", cascade="all, delete-orphan", order_by="Reply.created_at")


class Reply(Base):
    __tablename__ = "replies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    entry_id = Column(Integer, ForeignKey("entries.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False, default="aaina")  # aaina or user
    text_encrypted = Column(Text, nullable=False)
    persona = Column(String(50), default="best_friend")
    ai_provider = Column(String(50), default="gemma")
    ai_fallback = Column(Boolean, default=False)
    helpful_flag = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    entry = relationship("Entry", back_populates="replies")


class MemoryItem(Base):
    __tablename__ = "memory_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    fact_text = Column(Text, nullable=False)
    category = Column(String(50), default="general")
    source_entry_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="memory_items")


class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    ring = Column(String(50), nullable=False)  # "close friend", "family", "colleague"
    note = Column(Text, nullable=True)
    last_mentioned = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="people")


class Guardian(Base):
    __tablename__ = "guardians"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    contact = Column(String(200), nullable=False)
    consent_confirmed_at = Column(DateTime, default=datetime.utcnow, nullable=True)

    user = relationship("User", back_populates="guardians")


class ParentAlert(Base):
    __tablename__ = "parent_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trigger_reason = Column(String(255), nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    channel = Column(String(50), default="simulated")  # sms, email, simulated

    user = relationship("User", back_populates="parent_alerts")


class Nudge(Base):
    __tablename__ = "nudges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # 2_day, 4_day, 7_day, custom
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    opened = Column(Boolean, default=False)

    user = relationship("User", back_populates="nudges")


class SafetyEvent(Base):
    __tablename__ = "safety_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entry_id = Column(Integer, nullable=True)
    level = Column(String(20), nullable=False)  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="safety_events")
