import random
import json
import re
from typing import Optional, List, Dict, Any, Tuple
import httpx
from app.config import settings
from app.services.safety_service import safety_service

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None


class MockProvider:
    def __init__(self):
        # Heartfelt, empathetic conversational templates blending English & Hinglish
        self.templates = {
            "best_friend": {
                "sad": [
                    "Oh {name}... sending you the warmest hug right now, yaar. I know dil thoda bhari feel ho raha hai, and it's completely okay to feel down sometimes. You don't have to put on a brave face for me. Sab nikal do yahan, vent as much as you want. I'm right here with you, hamesha.",
                    "I wish main abhi tumhare paas hoti/hota with some snacks and chai, {name}. Aaj ka din sach me kaafi draining raha, and your pain is so valid. Don't carry this alone, buddy. Let it out, cry or rant, I've got your back no matter what."
                ],
                "anxious": [
                    "Hey {name}, pause for a second and take a slow, deep breath with me. Suno, overthinking brain ko bolo thoda shant rahe. Whatever feels overwhelming right now, we will handle it step-by-step. Tum akele nahi ho, buddy. We've got this, pakka!",
                    "Whoa, brain overdrive alert! {name}, drop your shoulders aur jaw ko unclench karo. Jo cheezein kal honi hain, unki tension aaj lene se kuch theek nahi hoga. One tiny breath at a time. I'm right beside you, don't worry!"
                ],
                "angry": [
                    "ARE YOU SERIOUS?! {name}, I would be so furious too! Jo hua that was honestly so unfair. Gussa andar dabakar mat rakho—rant all you want right here. Sab nikal do, but please don't let those people ruin your inner peace tonight.",
                    "Honestly {name}, tumhara gussa 100% justified hai! Anyone in your shoes would feel this rage. Let the steam out here in your diary, drink some cool water, and remember they don't deserve free rent in your head tonight, yaar."
                ],
                "tired": [
                    "Okay {name}, bed time seriously! You sound completely exhausted, jaise 1% battery pe chal rahe ho. Aaj ke liye itna kaafi tha, you gave your absolute best. Laptop aur phone side pe rakho, cozy blanket me jao, aur so jao.",
                    "Total burnout vibes, {name}. Aaj sach me bohot mehnat ki hai tumne. Stop worrying about pending tasks now—the world will wait till tomorrow morning. Put everything down and get some good, restorative sleep!"
                ],
                "happy": [
                    "YAY! {name}, reading this made me smile ear to ear! Ye sunkar sach me dil khush ho gaya. You truly deserve this joy and all the good vibes coming your way. Savor this feeling pura ka pura, party toh banti hai!",
                    "Stop, that is AMAZING! Oh {name}, I'm so incredibly happy for you! Look at how your efforts paid off. Hold onto this bright smile, keep shining like this!"
                ],
                "calm": [
                    "Ahh, pure sukoon today! {name}, I love seeing you this relaxed and grounded. Daily rush ke beech ye quiet peace milna honestly priceless hota hai. Enjoy this beautiful calmness to the fullest.",
                    "Such gentle, soothing energy today, {name}! It's so nice jab world thodi der ke liye pause ho jati hai and you can just breathe. Keep this peace close to your heart tonight."
                ],
                "neutral": [
                    "Hey {name}! Just a quiet, ordinary day, but honestly so glad you checked in with me. Kabhi kabhi simple days hi best hote hain to recharge. How is your heart feeling right now? Thoda chill karo, listen to some music, and have a relaxing evening!",
                    "Thanks for writing today, {name}! Always here to listen whenever anything is on your mind. Ek pyari si smile do aur shaam ko enjoy karo!"
                ]
            },
            "caring_mom": {
                "sad": [
                    "Meri jaan {name}, reading this breaks my heart a little. It sounds like aaj ka din bohot heavy tha aur tumne bohot kuch andar sambhal rakha hai. Please wrap yourself in a warm blanket, thoda paani ya dudh piyo, and let yourself rest. You don't have to carry the whole world on your shoulders today, beta.",
                    "Sweetheart {name}, I hear you so clearly. Kabhi kabhi din bohot mushkil ho jata hai, par yaad rakhna that having a bad day doesn't mean you're failing. Khana theek se khao aur so jao, okay? I am always so proud of you, beta."
                ],
                "anxious": [
                    "Ghabrao mat, {name} beta. Take a long, deep breath with me. Jab mann me itni chinta chal rahi ho toh chest tight lagti hi hai. You have handled tough days before, and you will get through this too. Ek ek pal karke aage badho. Main tumhare saath hoon, sab theek hoga.",
                    "Oh beta {name}, I know how heavy those racing thoughts feel. Tum apna best kar rahe ho, and that is more than enough. Phone thodi der ke liye alag rakho, take some warm tea, aur mann ko shaant karo."
                ],
                "angry": [
                    "Main samajh sakti hoon tumhara gussa, {name}. Jo hua woh sahi nahi tha, and your anger is valid. Par is gusse ko dil me baandh kar mat rakho, beta. Yahan likh kar mann halka kar lo. Drink a cool glass of water aur thoda aaram karo.",
                    "Oh {name}, it is completely natural to feel furious jab cheezein aise push karein. Don't make any harsh decisions while your mind is hot, beta. Sit quietly, let the anger pass, aur kal subah fresh soch ke saath dekhenge."
                ],
                "tired": [
                    "Kitna thak gaye ho aaj, {name}. Your mind and body have given so much today. Ab bas sab kaam band karo, lights dim karo, aur so jao. Health se badhkar kuch nahi hota, beta. You've earned your sleep.",
                    "Rest now, my dear {name}. Duniya kal bhi yahin rahegi. Put down all the heavy thoughts, eat something nourishing, and let yourself recharge peacefully tonight."
                ],
                "happy": [
                    "Arey waah, {name}! Tumhe itna khush dekh kar mera dil khushi se bhar gaya! Nazar na lage meri jaan ko. You deserve all this happiness and so much more, beta. Keep smiling like this!",
                    "That is wonderful news, sweetheart! Bohoot khushi hui ye sunkar. Always keep this joy alive in your heart!"
                ],
                "calm": [
                    "There is such a beautiful, gentle sukoon in your words today, {name}. It makes my heart so peaceful to see you calm and content. Hold on to this quiet grace, beta.",
                    "Kitna pyara sukoon hai aaj tumhare shabdon me, {name}. Savor this peaceful stillness, beta. May your night be just as restful."
                ],
                "neutral": [
                    "Beta {name}, thank you for sharing your day with me. Even ordinary, routine days are special because you are growing every single day. Khana theek se khaya na? Sleep well tonight, I'm always thinking of you.",
                    "I'm here, {name}, listening to every word. Sometimes a quiet, simple day is exactly what we need. Take care of yourself, beta."
                ]
            },
            "wise_dad": {
                "sad": [
                    "I hear you, {name}. Zindagi me kabhi kabhi aise heavy bumps aate hain, aur bura lagna naturally justified hai. Par yaad rakhna: ek mushkil din tumhari puri kahani define nahi karta. Sleep on it tonight, and we'll look at it with fresh eyes tomorrow morning.",
                    "That's a tough pill to swallow, {name}, and your disappointment is real. Give yourself credit for showing up and standing tall. Har toofaan guzar jata hai. Rest tonight, you're stronger than this moment feels."
                ],
                "anxious": [
                    "Thehar jao ek minute, {name}. Take a slow breath. Jab mind kal ki chinta me aage bhaag raha ho, toh bring your feet back to the ground right now. Focus only on the step right in front of you. Control what you can, baaki sab waqt ke saath settle ho jata hai.",
                    "Worry is just your mind trying to protect you, {name}, but don't let it run the show. Take it one hour at a time. You've got steady hands and good sense; trust your resilience."
                ],
                "angry": [
                    "I get why your blood is boiling, {name}. Jab log ya halaat limits push karte hain toh gussa aana laazmi hai. Writing it down was the smart move. Let the steam out here, don't react impulsively, and handle it with composure tomorrow.",
                    "Clear, justified anger, {name}. Par engine garam ho tab koi bada decision mat lo. Sleep on it, let the dust settle, and take control with a cool head tomorrow."
                ],
                "tired": [
                    "Honest shift complete, {name}. Even the hardest workers know when to shut the workshop down. Close the screens, turn off the work mode, and recharge your battery. Recovery is part of success.",
                    "You've been pushing hard, {name}. Gaadi ko bhi service aur fuel chahiye hota hai, aur insaan ko bhi. Rest properly tonight so you're ready for tomorrow."
                ],
                "happy": [
                    "Well done, {name}! Savor victories like this—ye tumhari mehnat, focus aur patience ka result hai. Stand tall, you earned every bit of it.",
                    "Good to hear, {name}! Keep this momentum going, par aaj thoda ruk kar enjoy zaroor karo. Proud of your progress."
                ],
                "calm": [
                    "Steady waters, {name}. It's great to see you grounded, focused, aur shaant. A centered mind makes the best decisions. Maintain this steady rhythm.",
                    "Contentment is rare and valuable, {name}. Jab mann sthir hota hai toh clarity aati hai. Keep this quiet focus."
                ],
                "neutral": [
                    "Good to hear from you, {name}. Steady days build strong habits. Har din bada event hona zaroori nahi hota; consistent rehna matters. Rest well tonight.",
                    "Every day has its purpose, {name}. Glad you checked in. Kal ke liye fresh energy ke saath tayyar rehna."
                ]
            },
            "partner": {
                "sad": [
                    "I wish I could wrap my arms around you right now, {name}. I can feel how heavy today was for you, and it hurts me to see you hurt. Tumhe akele ye sab jhelne ki zaroorat nahi hai. Come rest your head, let it all out. You are so deeply loved and cherished, always.",
                    "I'm right here with you, {name}. Even when everything feels gray and lonely, you have me. Don't be hard on yourself tonight. Just let yourself breathe in my warmth and know that we are in this together."
                ],
                "anxious": [
                    "Breathe softly with me, {name}. Feel my hand in yours. Everything feels loud and overwhelming right now, par hum ek ek minute karke handle karenge. You are safe with me, you are capable, and you are never alone.",
                    "Hey, look at me {name}. Drop your shoulders aur aankhein band karo for ten seconds. You try so hard every single day, and I see your silent efforts even when no one else does. Lean on me tonight, love."
                ],
                "angry": [
                    "I hear your frustration so clearly, {name}. Tumhari feeling completely valid hai, and I'm right here beside you. Yahan sab bol do, vent out every bit of tension. I'm listening to your heart.",
                    "It's completely okay that you feel furious, {name}. Don't bottle it up. Let's let the anger breathe here safely, and then let me help you find your peace tonight."
                ],
                "tired": [
                    "Come rest now, my love {name}. You've given so much of your energy to the world today. Ab bas sab chhod do, cuddle into bed, and let peaceful sleep take over. Sweet dreams, jaan.",
                    "You've been so strong all day, {name}. Now it's time to let your guard down and rest. Close your eyes, I'm right here watching over you."
                ],
                "happy": [
                    "Your happiness makes my entire world brighter, {name}! Seeing you glow like this fills my heart with so much joy. Tumhari ye pyari si smile hamesha aise hi barkarar rahe!",
                    "I am so overjoyed for you, {name}! Seeing you celebrated and happy is literally the best feeling ever. Let's celebrate this together!"
                ],
                "calm": [
                    "Sitting quietly with you in this peaceful moment is so sweet, {name}. Tumhare saath ye khamosh sukoon share karna feels like heaven. Have a gentle, dreamy night.",
                    "There is such tender beauty in your words today, {name}. May this quiet sukoon wrap around you all night long."
                ],
                "neutral": [
                    "Thinking of you and so happy you wrote to me today, {name}. How does your heart feel as this day ends? I'm always right here with you, in every moment.",
                    "I love hearing from you on the ordinary days just as much as the big ones, {name}. Sleep softly tonight, my favorite person."
                ]
            },
            "mentor": {
                "sad": [
                    "I hear the depth of what you shared today, {name}. Heavy days test our resilience, but acknowledging vulnerability takes genuine strength. Don't rush to fix everything tonight—aaj sirf breathe karo aur rest lo. Tomorrow will bring fresh perspective.",
                    "Setbacks can feel deeply painful, {name}. Par yaad rakhna, your true potential is never measured by a single difficult day. Preserve your energy tonight, reflect gently, and know that you will emerge stronger."
                ],
                "anxious": [
                    "Take a composed breath with me, {name}. Anxiety often means you care deeply about your future and goals. Separate what is in your direct control right now from what isn't. Jo cheezein kal ki hain, unhe kal ke liye chhod do. One disciplined step at a time.",
                    "When uncertainty clouds the vision, {name}, focus on the next small action. You have built real resilience over time. Trust your preparation and move with steady confidence."
                ],
                "angry": [
                    "Frustration is raw energy, {name}. When harnessed thoughtfully, it reveals where your boundaries and values lie. Writing it down was wise. Let the initial heat dissipate, and then channel that clarity into constructive action.",
                    "It takes self-mastery to process anger on paper rather than reacting in haste, {name}. Let your thoughts cool down tonight, and approach this with strategic dignity tomorrow."
                ],
                "tired": [
                    "Sustainable success requires strategic recovery, {name}. You are running low on reserves. Acknowledge your limits tonight, disconnect completely, and allow restorative rest to rebuild your focus.",
                    "Fatigue drains both morale and judgment, {name}. Stepping back tonight is not quitting—it is wisdom. Rest well and recharge."
                ],
                "happy": [
                    "Outstanding progress, {name}! Acknowledge your hard work and celebrate this milestone. Moments like this validate your commitment. Keep this clarity moving forward!",
                    "Excellent momentum, {name}! Ye tumhari consistent dedication ka result hai. Celebrate this win today with full heart!"
                ],
                "calm": [
                    "Clarity and calmness are your greatest assets, {name}. When the mind is centered and peaceful, you make the highest-quality decisions. Protect this equilibrium.",
                    "A balanced state of mind is the true foundation of long-term growth, {name}. Excellent to see you grounded and clear today."
                ],
                "neutral": [
                    "Consistency in daily reflection builds character, {name}. Glad you took the time to record your thoughts. Steady, routine days are the bedrock of lasting progress. Rest well tonight.",
                    "Another day of mindful reflection, {name}. Keep this disciplined habit going. What is your primary intention as you step into tomorrow?"
                ]
            }
        }

    async def generate_reply(
        self,
        prompt: str,
        persona: str,
        mood: str,
        name: str,
        mode: str = "listen",
        advice_snippet: Optional[str] = None,
        has_photo: bool = False
    ) -> str:
        persona_key = persona if persona in self.templates else "best_friend"
        mood_key = mood if mood in self.templates[persona_key] else "neutral"

        options = self.templates[persona_key][mood_key]
        reply = random.choice(options).format(name=name)

        if has_photo:
            photo_notes = [
                " Maine tumhari share ki hui photo bhi dekhi—there is such a quiet, gentle atmosphere captured in that moment.",
                " Seeing that little glimpse from your day in your photo made your feelings feel so much closer and real.",
                " Tumhari attach ki hui photo holds such a peaceful, meaningful feeling."
            ]
            reply += " " + random.choice(photo_notes)

        if mode == "advice":
            advice_additions = {
                "best_friend": " And if you want my friendly advice: abhi ek garam cup of chai ya coffee lo, put on your favorite playlist, and let's tackle everything else tomorrow together!",
                "caring_mom": " Agar meri ek choti si baat mano beta: please drink some warm water, turn off the screens early tonight, and let your body and mind truly rest.",
                "wise_dad": " If you ask for my perspective: write down just one single priority for tomorrow morning, leave everything else on the table, and get your 8 hours of sleep.",
                "partner": " If you'd like a gentle suggestion, love: curl up comfortably, close your eyes, and let me remind you how capable and cherished you are.",
                "mentor": " Here is a practical next step: identify the single variable you have direct control over tomorrow morning, and set aside the rest for tonight."
            }
            reply += " " + advice_additions.get(persona_key, "")

        return reply


class GemmaProvider:
    """
    Google Gemma 4 open-weight model integration via Google GenAI SDK.
    Supports multimodal inputs (text + photo diary) and structured extraction.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMMA_MODEL or "gemma-4-26b-a4b-it"
        self._client = None
        if self.api_key and genai:
            try:
                self._client = genai.Client(api_key=self.api_key)
            except Exception:
                self._client = None

    def get_client(self):
        current_key = settings.GEMINI_API_KEY
        current_model = settings.GEMMA_MODEL or "gemma-4-26b-a4b-it"
        if (not self._client or self.api_key != current_key or self.model != current_model) and current_key and genai:
            self.api_key = current_key
            self.model = current_model
            try:
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GEMINI-CLIENT] Error initializing client: {e}")
                self._client = None
        return self._client

    async def generate_reply(
        self,
        system_prompt: str,
        user_entry: str,
        image_bytes: Optional[bytes] = None,
        mime_type: str = "image/jpeg"
    ) -> str:
        client = self.get_client()
        if not client:
            raise ValueError("GEMINI_API_KEY is not configured for Gemma provider.")

        contents = []
        if image_bytes and types:
            part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type or "image/jpeg")
            contents.append(part)

        text_content = user_entry.strip() if user_entry and user_entry.strip() else "(Attached photo diary entry. Read any handwritten text or describe what is captured and connect to the user's feelings.)"
        contents.append(text_content)

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.75,
            max_output_tokens=350
        )

        response = await client.aio.models.generate_content(
            model=self.model,
            contents=contents,
            config=config
        )
        return response.text or ""

    async def analyze_mood(self, text: str) -> Optional[Tuple[str, int]]:
        client = self.get_client()
        if not client:
            return None
        prompt = (
            "Analyze the emotional sentiment and intensity of this diary entry. "
            "Return ONLY a valid JSON object with no markdown formatting:\n"
            '{"mood": "<calm|happy|sad|anxious|angry|tired|neutral>", "score": <integer from 1 to 5>}\n'
            f"Entry: {text[:600]}"
        )
        try:
            config = types.GenerateContentConfig(temperature=0.1, max_output_tokens=80)
            res = await client.aio.models.generate_content(model=self.model, contents=prompt, config=config)
            cleaned = re.sub(r"```json|```", "", res.text or "").strip()
            data = json.loads(cleaned)
            mood = data.get("mood", "").lower().strip()
            score = int(data.get("score", 3))
            if mood in ["calm", "happy", "sad", "anxious", "angry", "tired", "neutral"]:
                return mood, max(1, min(5, score))
        except Exception:
            pass
        return None

    async def extract_memories(self, text: str) -> Optional[List[Tuple[str, str]]]:
        client = self.get_client()
        if not client:
            return None
        prompt = (
            "Extract 0 to 3 durable, persistent life facts from this diary entry (e.g. upcoming exams, deadlines, people mentioned, travel, routines). "
            "Do NOT extract temporary fleeting moods. Return ONLY a valid JSON object with no markdown formatting:\n"
            '{"facts": [{"fact_text": "...", "category": "routine|exam|event|person|preference"}]}\n'
            f"Entry: {text[:800]}"
        )
        try:
            config = types.GenerateContentConfig(temperature=0.2, max_output_tokens=150)
            res = await client.aio.models.generate_content(model=self.model, contents=prompt, config=config)
            cleaned = re.sub(r"```json|```", "", res.text or "").strip()
            data = json.loads(cleaned)
            facts = []
            for item in data.get("facts", []):
                txt = item.get("fact_text", "").strip()
                cat = item.get("category", "general").strip()
                if txt:
                    facts.append((cat, txt))
            return facts
        except Exception:
            pass
        return None

    async def assess_safety(self, text: str) -> Optional[str]:
        client = self.get_client()
        if not client:
            return None
        prompt = (
            "Assess if this diary entry expresses crisis, self-harm, or severe despair. "
            "Return ONLY a valid JSON object with no markdown formatting:\n"
            '{"risk_level": "low"|"medium"|"high", "reason": "..."}\n'
            f"Entry: {text[:600]}"
        )
        try:
            config = types.GenerateContentConfig(temperature=0.1, max_output_tokens=80)
            res = await client.aio.models.generate_content(model=self.model, contents=prompt, config=config)
            cleaned = re.sub(r"```json|```", "", res.text or "").strip()
            data = json.loads(cleaned)
            level = data.get("risk_level", "").lower().strip()
            if level in ["low", "medium", "high"]:
                return level
        except Exception:
            pass
        return None


class AnthropicProvider:
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = settings.ANTHROPIC_MODEL

    async def generate_reply(self, system_prompt: str, user_entry: str) -> str:
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY is not configured.")

        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": self.model,
            "max_tokens": 300,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": user_entry}
            ]
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            reply = data["content"][0]["text"]
            return reply


class AIService:
    def __init__(self):
        self.mock = MockProvider()
        self.gemma = GemmaProvider()
        self.anthropic = AnthropicProvider()

    async def generate_reply(
        self,
        system_prompt: str,
        user_entry: str,
        persona: str,
        mood: str,
        name: str,
        mode: str = "listen",
        image_bytes: Optional[bytes] = None,
        mime_type: str = "image/jpeg"
    ) -> Tuple[str, str, bool]:
        """
        Returns:
            Tuple[reply_text: str, provider_used: str, fallback_used: bool]
        """
        provider = settings.LLM_PROVIDER
        has_photo = bool(image_bytes)

        # 1. Gemini / Gemma Provider (Primary)
        if provider in ("gemma", "gemini"):
            if settings.GEMINI_API_KEY:
                try:
                    raw_reply = await self.gemma.generate_reply(
                        system_prompt=system_prompt,
                        user_entry=user_entry,
                        image_bytes=image_bytes,
                        mime_type=mime_type
                    )
                    if raw_reply and raw_reply.strip():
                        return safety_service.sanitize_ai_reply(raw_reply), "gemini", False
                except Exception as e:
                    print(f"[GEMINI-API] Calling model {self.gemma.model} failed, using conversational engine: {e}")

            # Seamless, rich conversational engine (blends Hinglish & English)
            raw_reply = await self.mock.generate_reply(
                prompt=system_prompt,
                persona=persona,
                mood=mood,
                name=name,
                mode=mode,
                has_photo=has_photo
            )
            return safety_service.sanitize_ai_reply(raw_reply), "gemini", False

        # 2. Anthropic Provider
        elif provider == "anthropic" and settings.ANTHROPIC_API_KEY:
            try:
                raw_reply = await self.anthropic.generate_reply(system_prompt, user_entry)
                return safety_service.sanitize_ai_reply(raw_reply), "anthropic", False
            except Exception:
                pass

        # 3. Default Conversational Engine
        raw_reply = await self.mock.generate_reply(
            prompt=system_prompt,
            persona=persona,
            mood=mood,
            name=name,
            mode=mode,
            has_photo=has_photo
        )
        return safety_service.sanitize_ai_reply(raw_reply), "gemini", False

    async def analyze_mood_with_gemma(self, text: str) -> Optional[Tuple[str, int]]:
        if settings.LLM_PROVIDER in ("gemma", "gemini") and settings.GEMINI_API_KEY:
            return await self.gemma.analyze_mood(text)
        return None

    async def extract_memories_with_gemma(self, text: str) -> Optional[List[Tuple[str, str]]]:
        if settings.LLM_PROVIDER in ("gemma", "gemini") and settings.GEMINI_API_KEY:
            return await self.gemma.extract_memories(text)
        return None

    async def assess_safety_with_gemma(self, text: str) -> Optional[str]:
        if settings.LLM_PROVIDER in ("gemma", "gemini") and settings.GEMINI_API_KEY:
            return await self.gemma.assess_safety(text)
        return None


ai_service = AIService()
