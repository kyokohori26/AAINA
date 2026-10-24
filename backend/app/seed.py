import json
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app import models
from app.security import hash_password
from app.services.crypto_service import crypto_service

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("[*] Seeding Aaina database...")

    # 1. Clean existing demo accounts if present
    existing_demo = db.query(models.User).filter(models.User.email.in_(["demo@aaina.app", "aarav@aaina.app"])).all()
    for u in existing_demo:
        db.delete(u)
    db.commit()

    # 2. Create primary demo user: Anushri (Adult, age 21)
    now = datetime.utcnow()
    hashed_pwd = hash_password("Demo@1234")

    user_demo = models.User(
        email="demo@aaina.app",
        password_hash=hashed_pwd,
        name="Anushri Sharma",
        age=21,
        created_at=now - timedelta(days=20)
    )
    db.add(user_demo)
    db.commit()
    db.refresh(user_demo)

    # Demo Profile
    routine_dict = {
        "wake_time": "07:30",
        "sleep_time": "23:45",
        "work_study_hours": "09:30 - 17:30",
        "free_time": "Late evenings"
    }
    profile_demo = models.Profile(
        user_id=user_demo.id,
        display_name="Anushri",
        routine_json=json.dumps(routine_dict),
        personality_tags="creative, overthinker, empathetic, ambitious",
        stresses="presentation nerves, tight deadlines, feeling misunderstood",
        cheers="masala chai, acoustic guitar music, starry evening walks, cozy books",
        support_style="comfort",
        default_persona="best_friend",
        reply_length="medium",
        language="english",
        profile_summary="Anushri is a creative and empathetic 21-year-old student who values gentle emotional validation. She often balances busy study schedules and appreciates warm, grounded comfort when stressed.",
        remember_enabled=True,
        nudges_enabled=True,
        nudge_quiet_start="22:30",
        nudge_quiet_end="08:00",
        music_choice="soft_pad",
        music_volume=0.25
    )
    db.add(profile_demo)

    # Circle People for Anushri
    circle_people = [
        ("Riya", "close friend", "College bestie, always up for chai breaks and honest talks", now - timedelta(days=1)),
        ("Mom", "family", "Call every weekend, loves hearing about daily life", now - timedelta(days=4)),
        ("Papa", "family", "Always gives steady, practical perspective", now - timedelta(days=5)),
        ("Rohan", "close friend", "Project partner and gym buddy", now - timedelta(days=2)),
        ("Prof. Das", "colleague", "Faculty advisor on final year capstone", now - timedelta(days=8))
    ]
    for name, ring, note, last_ment in circle_people:
        db.add(models.Person(
            user_id=user_demo.id,
            name=name,
            ring=ring,
            note=note,
            last_mentioned=last_ment
        ))

    # Memory Items for Anushri
    memories = [
        ("Final project presentation scheduled for mid-November.", "exam"),
        ("Finds peace by drinking masala chai while journaling at night.", "routine"),
        ("Close emotional connection with college friend Riya.", "person"),
        ("Tends to overthink before major public speaking events.", "preference"),
        ("Prefers emotional validation first before looking at practical fixes.", "preference"),
        ("Working on building a healthier bedtime routine around 11:30 PM.", "routine")
    ]
    for fact, cat in memories:
        db.add(models.MemoryItem(
            user_id=user_demo.id,
            fact_text=fact,
            category=cat,
            created_at=now - timedelta(days=10)
        ))

    # 14 Days of rich diary entries with replies
    sample_entries = [
        (
            13,
            "Started my major project research today. Found some really exciting papers on ambient AI interfaces. Feeling motivated but slightly overwhelmed by how much there is to build.",
            "happy", 4, "mentor", "listen",
            "What a strong start, Anushri! Finding that initial spark of excitement is half the battle. When the scope feels huge, just keep your eyes on the small piece right in front of you. What part of the research felt most inspiring to you?"
        ),
        (
            12,
            "Riya and I grabbed coffee between classes and ended up laughing until our stomachs hurt. Needed that lightness after such a chaotic week.",
            "happy", 5, "best_friend", "listen",
            "Aww Anushri, that sounds so lovely! Those unexpected coffee laughs with Riya are pure therapy. So happy you got that breathing room today—cherish those golden friendships!"
        ),
        (
            11,
            "Could barely sleep last night. Stared at the ceiling until 3 AM worrying about whether I'm doing enough. Feeling groggy and tired today.",
            "tired", 3, "caring_mom", "listen",
            "Oh sweetheart, sleepless nights leave the whole body so tender and drained. Please don't be hard on yourself today. Do the bare essentials, sip on some warm water or tea, and let yourself get into bed extra early tonight. You are doing plenty, Anushri."
        ),
        (
            10,
            "Had a productive coding session today. Fixed the stubborn state bug that was bugging me all weekend. Quiet contentment tonight.",
            "calm", 4, "wise_dad", "listen",
            "Good job, Anushri. There's real satisfaction in untangling a knot that had you stuck. You stayed patient with it and cracked it. Enjoy this quiet evening—you earned it."
        ),
        (
            9,
            "Mom called while I was running between lab sessions. I had to cut the call short and I felt so guilty after. I know she just wanted to check on me.",
            "sad", 3, "best_friend", "advice",
            "Hey, don't beat yourself up Anushri! You were in the middle of chaos, and moms understand that way more than we think. Just drop her a sweet two-line text tonight before sleeping letting her know you love her. She'll smile immediately."
        ),
        (
            8,
            "It rained all afternoon. I sat by the window watching the droplets trace lines down the glass with soft music playing. Felt genuinely peaceful.",
            "calm", 5, "partner", "listen",
            "That sounds so wonderfully tranquil, Anushri. Moments like watching the rain remind us to pause and just be. I'm so glad your heart had space for that peaceful beauty today."
        ),
        (
            7,
            "Got unexpected feedback on our draft report and felt really defensive at first. It stung, even though I know deep down some points were fair.",
            "anxious", 3, "mentor", "advice",
            "That sting is completely natural, Anushri—it shows you pour real heart into your work. Once the initial pinch fades, see if there are one or two tweaks that make the work even more undeniable. You've got the skill to refine it."
        ),
        (
            6,
            "Tired and irritable today. Small things kept grating on my nerves, like loud traffic and a forgotten umbrella. Just want today to end.",
            "angry", 3, "caring_mom", "listen",
            "Oh Anushri, we all have those days where the world just rubs every nerve raw. Let the day go, sweetheart. Take off the wet shoes, put on comfortable clothes, and wrap yourself in silence. Tomorrow will be softer."
        ),
        (
            5,
            "Spent 3 hours helping Rohan debug his database models. It felt so good to see his relief when it finally connected. Helping friends always lifts my mood.",
            "happy", 4, "best_friend", "listen",
            "You are such a solid friend, Anushri! Rohan is lucky to have you in his corner. That feeling of shared triumph when code finally clicks is unbeatable."
        ),
        (
            4,
            "Presentation dry run in class tomorrow morning. My stomach is already doing nervous flips. I know my slides, but public speaking always makes my voice shake.",
            "anxious", 4, "wise_dad", "advice",
            "I hear those jitters loud and clear, Anushri. Nervousness just means you care. Remember: the audience isn't looking for perfection, they're listening to your story. Take one slow breath before you begin speaking, and speak to one friendly face at a time."
        ),
        (
            3,
            "Dry run went much better than I feared! My voice trembled for the first 30 seconds, but once I got into the demo, I found my rhythm. Prof. Das gave encouraging nods.",
            "happy", 5, "partner", "listen",
            "I knew you could do it, Anushri! That initial tremble didn't stop you at all—you found your stride and owned the room. Look at how much courage you have inside you!"
        ),
        (
            2,
            "Quiet Sunday. Made masala chai, read two chapters of my novel, and didn't check social media all afternoon. Recharging my battery.",
            "calm", 4, "caring_mom", "listen",
            "Now that is how to spend a Sunday, my dear! Masala chai and quiet books are the sweetest medicine for a busy mind. Soak up this peace."
        ),
        (
            1,
            "Caught up with all my weekly tasks. Feeling steady and prepared for the week ahead.",
            "calm", 4, "wise_dad", "listen",
            "Clear decks and a steady head, Anushri. Going into a new week with order gives you breathing room. You're handling things with great maturity."
        ),
        (
            0,
            "Today was a bit lonely. Finished classes early and walked back alone. Just felt that sudden quiet heaviness when you enter an empty room.",
            "sad", 4, "best_friend", "listen",
            "Oh Anushri... that sudden silence when you close the door can hit surprisingly hard. I'm right here with you, listening to every bit of it. You are never truly alone, friend. Put on some cozy background tunes and let yourself just breathe."
        )
    ]

    for days_ago, text, mood, score, persona, mode, reply_text in sample_entries:
        entry_time = now - timedelta(days=days_ago, hours=3, minutes=15)
        entry = models.Entry(
            user_id=user_demo.id,
            text_encrypted=crypto_service.encrypt(text),
            mood_label=mood,
            mood_score=score,
            persona_used=persona,
            mode=mode,
            risk_level="low",
            created_at=entry_time
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)

        reply = models.Reply(
            entry_id=entry.id,
            role="aaina",
            text_encrypted=crypto_service.encrypt(reply_text),
            persona=persona,
            helpful_flag=True if days_ago > 2 else None,
            created_at=entry_time + timedelta(seconds=25)
        )
        db.add(reply)
        db.commit()

    # 3. Create Teen Demo User: Aarav (Age 14) for Family Care Link demonstration
    user_teen = models.User(
        email="aarav@aaina.app",
        password_hash=hashed_pwd,
        name="Aarav Mehta",
        age=14,
        created_at=now - timedelta(days=10)
    )
    db.add(user_teen)
    db.commit()
    db.refresh(user_teen)

    profile_teen = models.Profile(
        user_id=user_teen.id,
        display_name="Aarav",
        routine_json=json.dumps({"wake_time": "06:45", "sleep_time": "22:00"}),
        personality_tags="introvert, student, gamer, thoughtful",
        stresses="math tests, school competition, feeling left out",
        cheers="video games, drawing, pet dog Bruno",
        support_style="comfort",
        default_persona="best_friend",
        reply_length="short",
        language="english",
        profile_summary="Aarav is a 14-year-old student who loves drawing and gaming. Needs gentle reassurance during exam pressure.",
        remember_enabled=True,
        nudges_enabled=True
    )
    db.add(profile_teen)

    guardian_teen = models.Guardian(
        user_id=user_teen.id,
        name="Pooja Mehta",
        contact="pooja.mehta@example.com",
        consent_confirmed_at=now - timedelta(days=10)
    )
    db.add(guardian_teen)

    # 3 Stressed entries for Aarav in the last 4 days to showcase Family Care Link
    teen_entries = [
        (3, "Failed the surprise math quiz today. Everyone else seemed fine. I just felt like hiding in the bathroom.", "sad", 4, "wise_dad"),
        (2, "Argued with my teammates during group project. They made fun of my idea. I didn't say anything and just sat quietly.", "sad", 4, "caring_mom"),
        (1, "Can't study at all. Head hurts and I feel so much pressure for tomorrow's unit test.", "anxious", 5, "best_friend")
    ]
    for d_ago, t_text, t_mood, t_score, t_persona in teen_entries:
        t_time = now - timedelta(days=d_ago, hours=2)
        e = models.Entry(
            user_id=user_teen.id,
            text_encrypted=crypto_service.encrypt(t_text),
            mood_label=t_mood,
            mood_score=t_score,
            persona_used=t_persona,
            mode="listen",
            risk_level="medium" if d_ago == 1 else "low",
            created_at=t_time
        )
        db.add(e)
        db.commit()
        db.refresh(e)

        r = models.Reply(
            entry_id=e.id,
            role="aaina",
            text_encrypted=crypto_service.encrypt("I hear you, Aarav. School pressure can feel so overwhelming, but one test does not define who you are. Take a breather tonight."),
            persona=t_persona,
            created_at=t_time + timedelta(seconds=20)
        )
        db.add(r)
        db.commit()

    # Log a parent alert for Aarav
    db.add(models.ParentAlert(
        user_id=user_teen.id,
        trigger_reason="Frequent signs of school strain and anxiety over recent days",
        sent_at=now - timedelta(days=1),
        channel="simulated"
    ))

    # Add a sample nudge for Anushri demo simulation
    db.add(models.Nudge(
        user_id=user_demo.id,
        type="2_day",
        message="Hey Anushri, how was your day? Aaina is here whenever you want to talk.",
        sent_at=now - timedelta(hours=3),
        opened=False
    ))

    db.commit()
    db.close()
    print("[SUCCESS] Database successfully seeded!")
    print("   Demo User: demo@aaina.app / Demo@1234 (Anushri, 21 yrs, 14 days entries, Circle, Memory)")
    print("   Teen User: aarav@aaina.app / Demo@1234 (Aarav, 14 yrs, Guardian link, Stressed sequence)")

if __name__ == "__main__":
    seed_database()
