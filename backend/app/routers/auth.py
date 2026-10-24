from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=dict)
def signup(payload: schemas.UserSignup, db: Session = Depends(get_db)):
    # Age check: Under 13 is blocked
    if payload.age < 13:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aaina is designed for users aged 13 and above. Please ask a parent or guardian for help setting up an account."
        )

    existing = db.query(models.User).filter(models.User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed = hash_password(payload.password)
    user = models.User(
        email=payload.email.lower(),
        password_hash=hashed,
        name=payload.name,
        age=payload.age,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create empty default profile
    profile = models.Profile(
        user_id=user.id,
        display_name=payload.name.split()[0],
        default_persona="best_friend",
        support_style="comfort",
        reply_length="medium",
        language="english",
        remember_enabled=True,
        nudges_enabled=True
    )
    db.add(profile)
    db.commit()

    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "age": user.age,
            "has_profile": False,
            "needs_parent_link": 13 <= user.age <= 15
        }
    }

@router.post("/login", response_model=dict)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": str(user.id)})
    has_profile = bool(user.profile and user.profile.profile_summary)

    guardian = db.query(models.Guardian).filter(models.Guardian.user_id == user.id).first()
    needs_parent_link = (13 <= user.age <= 15) and (not guardian)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "age": user.age,
            "has_profile": has_profile,
            "needs_parent_link": needs_parent_link
        }
    }

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    guardian = db.query(models.Guardian).filter(models.Guardian.user_id == current_user.id).first()
    has_profile = bool(current_user.profile and current_user.profile.profile_summary)
    needs_parent_link = (13 <= current_user.age <= 15) and (not guardian)

    return schemas.UserOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        age=current_user.age,
        created_at=current_user.created_at,
        has_profile=has_profile,
        needs_parent_link=needs_parent_link
    )
