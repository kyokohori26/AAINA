from typing import List, Optional
from app import models
from app.prompts.system_rules import SYSTEM_RULES
from app.prompts.personas import PERSONA_PROMPTS

class PromptBuilder:
    def build_system_prompt(
        self,
        persona: str,
        profile: Optional[models.Profile],
        user: models.User,
        memories: List[str],
        recent_entry_summaries: List[str],
        mode: str = "listen",
        reply_length: str = "medium",
        language: str = "english",
        has_photo: bool = False
    ) -> str:
        persona_block = PERSONA_PROMPTS.get(persona, PERSONA_PROMPTS["best_friend"])
        user_name = (profile.display_name if profile and profile.display_name else user.name) or "Friend"
        
        profile_parts = [f"User Name: {user_name}"]
        if profile:
            if profile.support_style:
                profile_parts.append(f"Preferred Support Style: {profile.support_style}")
            if profile.personality_tags:
                profile_parts.append(f"Personality Traits: {profile.personality_tags}")
            if profile.stresses:
                profile_parts.append(f"Usual Stressors: {profile.stresses}")
            if profile.cheers:
                profile_parts.append(f"Things that Cheer Them Up: {profile.cheers}")
            if profile.routine_json:
                profile_parts.append(f"Daily Routine: {profile.routine_json}")
            if profile.profile_summary:
                profile_parts.append(f"Profile Summary: {profile.profile_summary}")

        profile_text = "\n".join(profile_parts)

        memory_text = "\n".join([f"- {m}" for m in memories]) if memories else "No specific past facts recorded yet."
        recent_text = "\n".join([f"- {s}" for s in recent_entry_summaries]) if recent_entry_summaries else "First or few recent entries."

        mode_instruction = (
            "USER MODE: JUST LISTEN. DO NOT give solutions or advice. Focus on acknowledging emotions, validating how hard/special this was, and offering heartfelt warmth."
            if mode == "listen"
            else "USER MODE: LISTEN AND GIVE ADVICE. First validate their emotions warmly, and then offer 1 or 2 gentle, practical suggestions."
        )

        length_guide = "Keep your reply concise and punchy, around 60 to 80 words." if reply_length == "short" else "Keep your reply warm, natural, and under 150 words."
        
        if language == "hindi":
            lang_guide = "Reply warmly and naturally in Hindi (हिंदी) using Devanagari script. Keep the tone compassionate and conversational."
        else:
            lang_guide = (
                "LANGUAGE STYLE: Respond in a natural, heartfelt blend of Hinglish and English both (conversational Hindi-English code-switching in Roman script, e.g., 'Aaj ka din sach me kaafi exhausting raha hoga, but I am so proud of how you handled it. Thoda warm chai lo, rest karo, and take a deep breath. You are never alone in this.'). Seamlessly blend both English and Hinglish so it feels deeply warm, relatable, and comforting."
            )

        photo_guide = ""
        if has_photo:
            photo_guide = """
- MULTIMODAL PHOTO DIARY:
  1. If the attached photo is a handwritten journal note or drawing with text, read/transcribe it and respond directly to what was written.
  2. If the photo shows an object, pet, activity, weather, or scene from their day, describe what you see in one gentle sentence and respond to how it connects to their day and feelings.
  3. STRICT ETHICAL RULE: Never attempt to infer identity or diagnose emotional states from human faces. Focus on the moment, atmosphere, and written words.
"""

        prompt = f"""{SYSTEM_RULES}

{persona_block}

USER CONTEXT:
{profile_text}

WHAT YOU REMEMBER ABOUT THEM (Facts & Routine):
{memory_text}

RECENT DIARY CONTEXT (Last few days):
{recent_text}

SPECIFIC INSTRUCTIONS FOR THIS REPLY:
- {mode_instruction}
- {length_guide}
- {lang_guide}{photo_guide}
- Always address them as {user_name}.
"""
        return prompt.strip()

prompt_builder = PromptBuilder()
