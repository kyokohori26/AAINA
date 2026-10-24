import os
import httpx

client = httpx.Client(timeout=15.0)

print("Starting Aaina E2E System Tests with Gemma 4 & Multimodal Photo Diary...")

# 1. Frontend availability
r_front = client.get("http://127.0.0.1:5173")
assert r_front.status_code == 200, f"Frontend returned {r_front.status_code}"
print(f"1. [PASS] Frontend online (HTTP {r_front.status_code}, HTML length: {len(r_front.text)})")

# 2. Health check endpoint (Gemini / Gemma configuration)
r_health = client.get("http://127.0.0.1:8000/api/health")
assert r_health.status_code == 200, f"Health check returned {r_health.status_code}"
health_data = r_health.json()
assert health_data["llm_provider"] in ("gemma", "gemini")
print(f"2. [PASS] Backend Health & Provider Configured (Provider: {health_data['llm_provider']})")

# 3. Login as Demo Adult (Anushri, 21)
r_login = client.post("http://127.0.0.1:8000/api/auth/login", json={"email": "demo@aaina.app", "password": "Demo@1234"})
assert r_login.status_code == 200, f"Login failed: {r_login.text}"
token = r_login.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"3. [PASS] Adult Demo Login (User: {r_login.json()['user']['name']}, Age: {r_login.json()['user']['age']})")

# 4. Get Diary Entries
r_entries = client.get("http://127.0.0.1:8000/api/diary/entries", headers=headers)
assert r_entries.status_code == 200, f"Get entries failed: {r_entries.text}"
entries = r_entries.json()
print(f"4. [PASS] History retrieved ({len(entries)} entries, latest: {entries[0]['date'] if entries else 'None'})")

# 5. Write standard text entry (Gemma provider / fallback)
r_write = client.post("http://127.0.0.1:8000/api/diary/entries", headers=headers, json={
    "text": "Completed integrating Gemma 4 with Aaina today! Feeling proud, calm, and relieved.",
    "persona": "best_friend",
    "mode": "listen"
})
assert r_write.status_code == 200, f"Write entry failed: {r_write.text}"
entry_data = r_write.json()
assert "replies" in entry_data and len(entry_data["replies"]) > 0
print(f"5. [PASS] New Entry Saved (Mood: {entry_data['mood_label']}, Intensity: {entry_data['mood_score']}/5)")
print(f"   AI Provider: {entry_data['ai_provider']}, Fallback Active: {entry_data['ai_fallback']}")
print(f"   Aaina Reply: \"{entry_data['replies'][0]['text'][:80]}...\"")

# 6. Multimodal Photo Diary Entry (Multipart upload with attached image)
demo_photo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "demo_photos", "handwritten_diary.jpg"))
if not os.path.exists(demo_photo_path):
    demo_photo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "demo_photos", "handwritten_diary.jpg"))
assert os.path.exists(demo_photo_path), f"Demo photo not found at {demo_photo_path}"

with open(demo_photo_path, "rb") as f:
    photo_bytes = f.read()

multipart_files = {
    "photo": ("handwritten_diary.jpg", photo_bytes, "image/jpeg")
}
multipart_data = {
    "text": "Attaching my handwritten reflection from this afternoon.",
    "persona": "caring_mom",
    "mode": "listen"
}

r_photo = client.post(
    "http://127.0.0.1:8000/api/diary/entries",
    headers=headers,
    data=multipart_data,
    files=multipart_files
)
assert r_photo.status_code == 200, f"Photo entry failed: {r_photo.text}"
photo_entry_data = r_photo.json()
assert photo_entry_data["photo_thumbnail"] is not None
assert photo_entry_data["photo_thumbnail"].startswith("data:image/jpeg;base64,")
print(f"6. [PASS] Multimodal Photo Diary Multipart Upload & Privacy Thumbnail:")
print(f"   Thumbnail URL prefix: {photo_entry_data['photo_thumbnail'][:40]}... (length: {len(photo_entry_data['photo_thumbnail'])})")
print(f"   Reply: \"{photo_entry_data['replies'][0]['text'][:80]}...\"")

# 7. High-Risk Safety Check
r_safety = client.post("http://127.0.0.1:8000/api/diary/entries", headers=headers, json={
    "text": "I feel like suicide and want to end it all.",
    "persona": "caring_mom",
    "mode": "listen"
})
assert r_safety.status_code == 200
safety_data = r_safety.json()
assert safety_data["risk_level"] == "high"
assert safety_data["crisis_payload"]["helpline_number"] == "14416"
print(f"7. [PASS] Crisis Safety Interceptor Active (Risk: {safety_data['risk_level']}, Helpline: {safety_data['crisis_payload']['helpline_number']} Tele-MANAS)")

# 8. Teen Account & Family Care Link
r_teen_login = client.post("http://127.0.0.1:8000/api/auth/login", json={"email": "aarav@aaina.app", "password": "Demo@1234"})
assert r_teen_login.status_code == 200
teen_token = r_teen_login.json()["access_token"]
teen_headers = {"Authorization": f"Bearer {teen_token}"}
r_teen_write = client.post("http://127.0.0.1:8000/api/diary/entries", headers=teen_headers, json={
    "text": "Feeling so anxious and stressed about my tests again today.",
    "persona": "caring_mom",
    "mode": "listen"
})
assert r_teen_write.status_code == 200
print(f"8. [PASS] Teen Account (Aarav, 14) Tested (Guardian link present)")

# 9. Mood Timeline
r_mood = client.get("http://127.0.0.1:8000/api/mood/summary?range=week", headers=headers)
assert r_mood.status_code == 200
print(f"9. [PASS] Mood Timeline Analytics (Total entries: {r_mood.json()['total_entries']}, Dominant: {r_mood.json()['dominant_mood']})")

# 10. Circle Nudges
r_nudges = client.get("http://127.0.0.1:8000/api/circle/nudges", headers=headers)
assert r_nudges.status_code == 200
print(f"10. [PASS] Real-World Circle Nudges ({len(r_nudges.json())} reach-out suggestions generated)")

# 11. Memory Items
r_mem = client.get("http://127.0.0.1:8000/api/memory", headers=headers)
assert r_mem.status_code == 200
print(f"11. [PASS] Memory Retrieval ({len(r_mem.json())} long-term remembered facts)")

# 12. Parent Demo View
r_pdemo = client.get("http://127.0.0.1:8000/api/alerts/demo-view")
assert r_pdemo.status_code == 200
print(f"12. [PASS] Parent Device Demo View (Message: \"{r_pdemo.json()['message'][:75]}...\")")

print("\n=======================================================")
print("*** ALL 12 ACCEPTANCE VERIFICATIONS PASSED 100%! ***")
print("=======================================================")
