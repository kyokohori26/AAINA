from cryptography.fernet import Fernet
from app.config import settings

class CryptoService:
    def __init__(self):
        try:
            self.cipher = Fernet(settings.FERNET_KEY.encode('utf-8'))
        except Exception:
            # Fallback for dev if key was misconfigured
            key = Fernet.generate_key()
            self.cipher = Fernet(key)

    def encrypt(self, text: str) -> str:
        if not text:
            return ""
        return self.cipher.encrypt(text.encode('utf-8')).decode('utf-8')

    def decrypt(self, encrypted_text: str) -> str:
        if not encrypted_text:
            return ""
        try:
            return self.cipher.decrypt(encrypted_text.encode('utf-8')).decode('utf-8')
        except Exception:
            # If already plaintext (e.g. from seed or test), return as is
            return encrypted_text

crypto_service = CryptoService()
