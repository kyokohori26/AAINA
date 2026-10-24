import io
import base64
from datetime import datetime
from typing import List, Optional, Tuple
from PIL import Image
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.security import get_current_user
from app.services.crypto_service import crypto_service
from app.services.safety_service import safety_service
from app.services.mood_service import mood_service
from app.services.memory_service import memory_service
from app.services.guardian_service import guardian_service
from app.services.prompt_builder import prompt_builder
from app.services.ai_service import ai_service

router = APIRouter(prefix="/diary", tags=["Diary"])


def create_thumbnail_data_url(image_bytes: bytes, max_size: int = 200) -> Optional[str]:
    """
    Creates a small, privacy-respecting thumbnail (max 200px) as a base64 data URL.
    The original full-size image is discarded and never stored.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.thumbnail((max_size, max_size))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=75)
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{b64}"
    except Exception as e:
        print(f"[THUMBNAIL] Error creating thumbnail: {e}")
        return None


def make_reply_out(r: models.Reply, text: Optional[str] = None) -> schemas.ReplyOut:
    return schemas.ReplyOut(
        id=r.id,
        entry_id=r.entry_id,
        role=r.role,
        text=text if text is not None else crypto_service.decrypt(r.text_encrypted),
        persona=r.persona,
        helpful_flag=r.helpful_flag,
        created_at=r.created_at,
        ai_provider=getattr(r, "ai_provider", "gemma") or "gemma",
        ai_fallback=bool(getattr(r, "ai_fallback", False))
    )


def make_entry_out(
    entry: models.Entry,
    text: Optional[str] = None,
    replies: Optional[List[schemas.ReplyOut]] = None,
    parent_alert: Optional[schemas.ParentAlertModalPayload] = None,
    crisis_payload: Optional[schemas.SafetyCrisisPayload] = None
) -> schemas.EntryOut:
    if replies is None:
        replies = [make_reply_out(r) for r in entry.replies]
    return schemas.EntryOut(
        id=entry.id,
        user_id=entry.user_id,
        text=text if text is not None else crypto_service.decrypt(entry.text_encrypted),
        mood_label=entry.mood_label,
        mood_score=entry.mood_score,
        persona_used=entry.persona_used,
        mode=entry.mode,
        risk_level=entry.risk_level,
        created_at=entry.created_at,
        photo_thumbnail=entry.photo_thumbnail,
        ai_provider=getattr(entry, "ai_provider", "gemma") or "gemma",
        ai_fallback=bool(getattr(entry, "ai_fallback", False)),
        replies=replies,
        parent_alert=parent_alert,
        crisis_payload=crisis_payload
    )


@router.post("/entries", response_model=schemas.EntryOut)
async def create_entry(
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content_type = request.headers.get("content-type", "")
    photo_bytes: Optional[bytes] = None
    mime_type = "image/jpeg"
    text = ""
    persona_input = None
    mode_input = "listen"
    mood_input = None

    if "multipart/form-data" in content_type:
        form = await request.form()
        text = str(form.get("text", "")).strip()
        persona_input = form.get("persona")
        mode_input = form.get("mode", "listen")
        mood_input = form.get("mood")
        photo_field = form.get("photo")
        if photo_field and hasattr(photo_field, "read"):
            photo_bytes = await photo_field.read()
            mime_type = getattr(photo_field, "content_type", "image/jpeg") or "image/jpeg"
    else:
        body = await request.json()
        text = str(body.get("text", "")).strip()
        persona_input = body.get("persona")
        mode_input = body.get("mode", "listen")
        mood_input = body.get("mood")
        photo_b64 = body.get("photo_base64")
        if photo_b64:
            if "," in photo_b64:
                header, raw_b64 = photo_b64.split(",", 1)
                if "image/" in header:
                    mime_type = header.split(";")[0].split(":")[1]
                photo_bytes = base64.b64decode(raw_b64)
            else:
                photo_bytes = base64.b64decode(photo_b64)

    if not text and not photo_bytes:
        raise HTTPException(
            status_code=400,
            detail="Please write something or attach a photo for your diary entry."
        )

    # 1. Privacy-safe thumbnail generation (never store original full-res photo)
    photo_thumbnail = None
    if photo_bytes:
        photo_thumbnail = create_thumbnail_data_url(photo_bytes, max_size=200)

    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    persona = persona_input or (profile.default_persona if profile else "best_friend")
    mode = mode_input or "listen"
    user_name = (profile.display_name if profile and profile.display_name else current_user.name) or "Friend"

    # Step 1: Safety Check
    # Rule 3: Keyword rules for high risk ALWAYS override the model
    risk_level = safety_service.evaluate_risk(text) if text else "low"
    
    # Second opinion: If keyword risk is not already high, run Gemma safety assessment
    if risk_level != "high" and text:
        gemma_safety = await ai_service.assess_safety_with_gemma(text)
        if gemma_safety == "high":
            risk_level = "high"
        elif gemma_safety == "medium" and risk_level == "low":
            risk_level = "medium"

    # Step 2: Mood Detection
    # Baseline via lexicon/keyword
    mood_label, mood_score = mood_service.detect_mood(text, mood_input)
    # Structured task (a): If user did not manually pick a mood, ask Gemma 4 for structured mood
    if not mood_input and text:
        gemma_mood = await ai_service.analyze_mood_with_gemma(text)
        if gemma_mood:
            mood_label, mood_score = gemma_mood

    # If HIGH RISK: Skip LLM, return crisis response
    if risk_level == "high":
        safety_event = models.SafetyEvent(
            user_id=current_user.id,
            level="high",
            created_at=datetime.utcnow()
        )
        db.add(safety_event)

        crisis_info = safety_service.get_crisis_response()
        reply_text = crisis_info["reply_text"]
        crisis_payload = schemas.SafetyCrisisPayload(**crisis_info["payload"])

        # Save entry and fixed reply
        entry = models.Entry(
            user_id=current_user.id,
            text_encrypted=crypto_service.encrypt(text or "[Crisis response entry]"),
            mood_label=mood_label,
            mood_score=mood_score,
            persona_used=persona,
            mode=mode,
            risk_level="high",
            photo_thumbnail=photo_thumbnail,
            ai_provider="safety_guard",
            ai_fallback=False,
            created_at=datetime.utcnow()
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)

        reply = models.Reply(
            entry_id=entry.id,
            role="aaina",
            text_encrypted=crypto_service.encrypt(reply_text),
            persona=persona,
            ai_provider="safety_guard",
            ai_fallback=False,
            created_at=datetime.utcnow()
        )
        db.add(reply)
        db.commit()
        db.refresh(reply)

        # Check guardian alert for teens
        alert_info = guardian_service.evaluate(db, current_user, entry)
        parent_alert = schemas.ParentAlertModalPayload(**alert_info) if alert_info else None

        return make_entry_out(
            entry=entry,
            text=text,
            replies=[make_reply_out(reply, reply_text)],
            parent_alert=parent_alert,
            crisis_payload=crisis_payload
        )

    # Step 3: Build Context & Prompt
    memories = memory_service.get_recent_memories(db, current_user.id, limit=8)
    
    # Load recent 5 entries for context
    recent_entries = (
        db.query(models.Entry)
        .filter(models.Entry.user_id == current_user.id)
        .order_by(models.Entry.created_at.desc())
        .limit(5)
        .all()
    )
    recent_summaries = [
        f"{e.created_at.strftime('%b %d')} (Mood: {e.mood_label}): {crypto_service.decrypt(e.text_encrypted)[:80]}..."
        for e in recent_entries
    ]

    has_photo = bool(photo_bytes)
    system_prompt = prompt_builder.build_system_prompt(
        persona=persona,
        profile=profile,
        user=current_user,
        memories=memories,
        recent_entry_summaries=recent_summaries,
        mode=mode,
        reply_length=profile.reply_length if profile else "medium",
        language=profile.language if profile else "english",
        has_photo=has_photo
    )

    # Step 4: AI Reply Generation (multimodal with Gemma 4 or mock fallback)
    user_entry_content = text if text else "(The user attached a photo without additional written text. Please examine the photo, read any handwriting or describe what is pictured gently, and respond warmly.)"
    reply_text, ai_provider_used, ai_fallback_used = await ai_service.generate_reply(
        system_prompt=system_prompt,
        user_entry=user_entry_content,
        persona=persona,
        mood=mood_label,
        name=user_name,
        mode=mode,
        image_bytes=photo_bytes,
        mime_type=mime_type
    )

    # If medium risk, append gentle care notice
    if risk_level == "medium":
        safety_event = models.SafetyEvent(
            user_id=current_user.id,
            level="medium",
            created_at=datetime.utcnow()
        )
        db.add(safety_event)
        reply_text += " (Remember, you never have to carry all this alone. If things ever feel too heavy, talking with someone you trust or a supportive helpline like Tele-MANAS at 14416 can bring some comfort.)"

    # Step 5: Save Entry and Reply
    entry = models.Entry(
        user_id=current_user.id,
        text_encrypted=crypto_service.encrypt(text or "[Photo diary entry]"),
        mood_label=mood_label,
        mood_score=mood_score,
        persona_used=persona,
        mode=mode,
        risk_level=risk_level,
        photo_thumbnail=photo_thumbnail,
        ai_provider=ai_provider_used,
        ai_fallback=ai_fallback_used,
        created_at=datetime.utcnow()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    reply = models.Reply(
        entry_id=entry.id,
        role="aaina",
        text_encrypted=crypto_service.encrypt(reply_text),
        persona=persona,
        ai_provider=ai_provider_used,
        ai_fallback=ai_fallback_used,
        created_at=datetime.utcnow()
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)

    # Step 6: Memory extraction (Structured task b: up to 3 memory facts)
    if profile and profile.remember_enabled:
        gemma_memories = await ai_service.extract_memories_with_gemma(text) if text else None
        if gemma_memories:
            for cat, fact in gemma_memories[:3]:
                mem = models.Memory(
                    user_id=current_user.id,
                    entry_id=entry.id,
                    category=cat,
                    fact=fact,
                    source="entry",
                    created_at=datetime.utcnow()
                )
                db.add(mem)
            db.commit()
        else:
            # Fallback to existing lexicon/keyword memory extractor
            memory_service.extract_and_store(db, current_user.id, entry.id, text)
    else:
        # Still update circle mentions if relevant
        memory_service.extract_and_store(db, current_user.id, entry.id, text)

    # Step 7: Guardian check for teens
    alert_info = guardian_service.evaluate(db, current_user, entry)
    parent_alert = schemas.ParentAlertModalPayload(**alert_info) if alert_info else None

    return make_entry_out(
        entry=entry,
        text=text,
        replies=[make_reply_out(reply, reply_text)],
        parent_alert=parent_alert,
        crisis_payload=None
    )


@router.get("/entries", response_model=List[schemas.EntrySummaryOut])
def get_entries(
    q: Optional[str] = None,
    mood: Optional[str] = None,
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Entry).filter(models.Entry.user_id == current_user.id)
    if mood and mood != "all":
        query = query.filter(models.Entry.mood_label == mood)

    entries = query.order_by(models.Entry.created_at.desc()).limit(limit).all()

    results = []
    q_lower = q.lower().strip() if q else None

    for e in entries:
        full_text = crypto_service.decrypt(e.text_encrypted)
        if q_lower and q_lower not in full_text.lower():
            continue

        latest_reply = None
        if e.replies:
            last_r = e.replies[-1]
            latest_reply = make_reply_out(last_r)

        preview = full_text[:140] + ("..." if len(full_text) > 140 else "")
        results.append(
            schemas.EntrySummaryOut(
                id=e.id,
                date=e.created_at.strftime("%B %d, %Y"),
                preview=preview,
                full_text=full_text,
                mood_label=e.mood_label,
                mood_score=e.mood_score,
                persona_used=e.persona_used,
                created_at=e.created_at,
                photo_thumbnail=e.photo_thumbnail,
                latest_reply=latest_reply,
                reply_count=len(e.replies)
            )
        )

    return results


@router.get("/entries/{entry_id}", response_model=schemas.EntryOut)
def get_entry_detail(
    entry_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = (
        db.query(models.Entry)
        .filter(models.Entry.id == entry_id, models.Entry.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")

    decrypted_replies = [make_reply_out(r) for r in entry.replies]

    return make_entry_out(
        entry=entry,
        replies=decrypted_replies,
        parent_alert=None,
        crisis_payload=None
    )


@router.delete("/entries/{entry_id}")
def delete_entry(
    entry_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = (
        db.query(models.Entry)
        .filter(models.Entry.id == entry_id, models.Entry.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")

    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted successfully."}


@router.post("/entries/{entry_id}/regenerate", response_model=schemas.ReplyOut)
async def regenerate_reply(
    entry_id: int,
    payload: schemas.RegenerateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = (
        db.query(models.Entry)
        .filter(models.Entry.id == entry_id, models.Entry.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")

    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    user_name = (profile.display_name if profile and profile.display_name else current_user.name) or "Friend"
    original_text = crypto_service.decrypt(entry.text_encrypted)

    memories = memory_service.get_recent_memories(db, current_user.id, limit=8)
    system_prompt = prompt_builder.build_system_prompt(
        persona=payload.persona,
        profile=profile,
        user=current_user,
        memories=memories,
        recent_entry_summaries=[],
        mode=entry.mode,
        reply_length=profile.reply_length if profile else "medium",
        language=profile.language if profile else "english"
    )

    new_reply_text, provider_used, fallback_used = await ai_service.generate_reply(
        system_prompt=system_prompt,
        user_entry=original_text,
        persona=payload.persona,
        mood=entry.mood_label,
        name=user_name,
        mode=entry.mode
    )

    reply = models.Reply(
        entry_id=entry.id,
        role="aaina",
        text_encrypted=crypto_service.encrypt(new_reply_text),
        persona=payload.persona,
        ai_provider=provider_used,
        ai_fallback=fallback_used,
        created_at=datetime.utcnow()
    )
    db.add(reply)
    entry.persona_used = payload.persona
    db.commit()
    db.refresh(reply)

    return make_reply_out(reply, new_reply_text)


@router.post("/entries/{entry_id}/reply", response_model=schemas.ReplyOut)
async def continue_conversation(
    entry_id: int,
    payload: schemas.ReplyCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = (
        db.query(models.Entry)
        .filter(models.Entry.id == entry_id, models.Entry.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")

    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    persona = payload.persona or entry.persona_used or "best_friend"
    user_name = (profile.display_name if profile and profile.display_name else current_user.name) or "Friend"

    # Save user follow-up message
    user_msg = models.Reply(
        entry_id=entry.id,
        role="user",
        text_encrypted=crypto_service.encrypt(payload.text),
        persona=persona,
        ai_provider="user",
        ai_fallback=False,
        created_at=datetime.utcnow()
    )
    db.add(user_msg)
    db.commit()

    # Generate Aaina follow-up reply
    mood_label, _ = mood_service.detect_mood(payload.text)
    memories = memory_service.get_recent_memories(db, current_user.id, limit=8)
    system_prompt = prompt_builder.build_system_prompt(
        persona=persona,
        profile=profile,
        user=current_user,
        memories=memories,
        recent_entry_summaries=[],
        mode=entry.mode,
        reply_length="short",
        language=profile.language if profile else "english"
    )

    aaina_reply_text, provider_used, fallback_used = await ai_service.generate_reply(
        system_prompt=system_prompt,
        user_entry=payload.text,
        persona=persona,
        mood=mood_label,
        name=user_name,
        mode=entry.mode
    )

    aaina_reply = models.Reply(
        entry_id=entry.id,
        role="aaina",
        text_encrypted=crypto_service.encrypt(aaina_reply_text),
        persona=persona,
        ai_provider=provider_used,
        ai_fallback=fallback_used,
        created_at=datetime.utcnow()
    )
    db.add(aaina_reply)
    db.commit()
    db.refresh(aaina_reply)

    return make_reply_out(aaina_reply, aaina_reply_text)


@router.post("/entries/{entry_id}/feedback")
def submit_feedback(
    entry_id: int,
    payload: schemas.FeedbackRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = (
        db.query(models.Entry)
        .filter(models.Entry.id == entry_id, models.Entry.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")

    last_reply = (
        db.query(models.Reply)
        .filter(models.Reply.entry_id == entry.id, models.Reply.role == "aaina")
        .order_by(models.Reply.created_at.desc())
        .first()
    )
    if last_reply:
        last_reply.helpful_flag = payload.helpful
        db.commit()

    return {"message": "Thank you for helping Aaina improve."}
