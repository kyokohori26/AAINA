import re
from typing import Tuple, Dict, Any

class SafetyService:
    def __init__(self):
        # High-risk patterns (Hopelessness, self-harm, suicide - English & Hinglish)
        self.high_risk_patterns = [
            r"\b(suicide|kill myself|end my life|end it all|want to die|wish i was dead|better off dead)\b",
            r"\b(cut myself|cutting myself|slit my wrist|self harm|hang myself|take all my pills)\b",
            r"\b(goodbye world|goodbye forever|no reason to live|ready to die)\b",
            # Hinglish
            r"\b(marne ka mann|jaan de dunga|jaan de dungi|khatam karna chahta|khatam karna chahti)\b",
            r"\b(apne aap ko khatam|zindagi khatam karni|zeher khana|mar jana chahiye)\b"
        ]

        # Medium-risk patterns (Serious despair, extreme isolation, prolonged exhaustion)
        self.medium_risk_patterns = [
            r"\b(nobody cares about me|nobody loves me|everyone hates me|completely invisible)\b",
            r"\b(can't take this anymore|cannot take this anymore|giving up on everything|can't go on)\b",
            r"\b(hopeless|feel completely worthless|feel like a burden|ruined everything)\b",
            r"\b(drowning in sadness|lost in darkness|unbearable pain)\b",
            # Hinglish
            r"\b(koi nahi hai mera|sab chhod gaye|koi pyaar nahi karta|bahut akele lag raha)\b",
            r"\b(ab bardasht nahi hota|haar maan li)\b"
        ]

    def evaluate_risk(self, text: str) -> str:
        if not text:
            return "low"
        lower_text = text.lower()

        # Check high risk
        for pattern in self.high_risk_patterns:
            if re.search(pattern, lower_text):
                return "high"

        # Check medium risk
        for pattern in self.medium_risk_patterns:
            if re.search(pattern, lower_text):
                return "medium"

        return "low"

    def get_crisis_response(self) -> Dict[str, Any]:
        return {
            "reply_text": (
                "I hear how much pain you are holding right now, and I care deeply about your safety. "
                "Because I am an AI and not a person or healthcare professional, please know that you do not have to carry this alone. "
                "Please reach out right now to someone you trust, or call Tele-MANAS at 14416 (free 24/7 across India) or a local crisis helpline. "
                "You matter, and there is compassionate, human help ready for you."
            ),
            "payload": {
                "is_crisis": True,
                "level": "high",
                "support_message": "You are not alone. There are people who want to listen and support you through this painful moment.",
                "helpline_name": "Tele-MANAS (Toll-Free, Govt of India)",
                "helpline_number": "14416",
                "alternate_helpline": "KIRAN Helpline: 1800-599-0019 | Vandrevala Foundation: +91 9999 666 555",
                "international_info": "In the US/Canada: Call or text 988. In the UK: Call 111 or 999. In Australia: 13 11 14."
            }
        }

    def sanitize_ai_reply(self, reply: str) -> str:
        """Ensure no diagnostic or clinical medication wording creeps into AI responses."""
        replacements = [
            (r"\b(diagnose you with|you have clinical depression|you suffer from bipolar|you have PTSD)\b", "what you are experiencing sounds really heavy"),
            (r"\b(take medication|prescribe you|take an antidepressant|dosage)\b", "speak with a doctor or counselor if that feels right for you"),
            (r"\b(as your therapist|in our therapy session)\b", "as your diary friend")
        ]
        sanitized = reply
        for pattern, replacement in replacements:
            sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)
        return sanitized

safety_service = SafetyService()
