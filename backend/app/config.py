import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key-for-development-40f1ede3d009d0fc334a512bf5697461")
    FERNET_KEY: str = os.getenv("FERNET_KEY", "vK3s3j9MDN6uSIHnj76XSE-sOhVttiqrLK8eIBbtN_w=")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini").lower()
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
    GEMMA_MODEL: str = os.getenv("GEMINI_MODEL") or os.getenv("GEMMA_MODEL") or "gemini-1.5-flash"
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'aaina.db'}")
    
    UPLOADS_DIR: Path = BASE_DIR / "uploads"
    
settings = Settings()
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
