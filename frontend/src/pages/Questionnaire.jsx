import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Plus, Trash2, Camera, Sparkles, Check } from "lucide-react";
import ProgressBar from "../components/ProgressBar";
import LogoMark from "../components/LogoMark";
import { profileAPI, guardianAPI } from "../services/api";
import { useUserStore } from "../store/userStore";

export default function Questionnaire() {
  const navigate = useNavigate();
  const { user, setProfile, showToast } = useUserStore();

  const isTeen = user && user.age >= 13 && user.age <= 15;
  const totalSteps = isTeen ? 7 : 6;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [wakeTime, setWakeTime] = useState("07:30");
  const [sleepTime, setSleepTime] = useState("23:30");
  const [workStudyHours, setWorkStudyHours] = useState("09:00 - 17:00");
  const [freeTime, setFreeTime] = useState("Evenings");

  const [selectedTraits, setSelectedTraits] = useState(["creative", "overthinker"]);
  const [stresses, setStresses] = useState("");
  const [cheers, setCheers] = useState("");

  const [supportStyle, setSupportStyle] = useState("comfort");
  const [people, setPeople] = useState([
    { name: "", ring: "close friend", note: "" }
  ]);

  const [displayName, setDisplayName] = useState(user?.name?.split(" ")[0] || "");
  const [language, setLanguage] = useState("english");

  // Guardian contact (for teens 13-15)
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(true);

  // Photo state
  const [photoDataUrl, setPhotoDataUrl] = useState(null);

  const traitsOptions = [
    "Shy", "Outgoing", "Overthinker", "Creative", "Busy", "Deep thinker",
    "Empathetic", "Ambitious", "Quiet", "Humorous", "Introvert"
  ];

  const supportStyles = [
    { id: "comfort", label: "Pure Comfort & Validation", desc: "Listen with warmth; make me feel heard first without fixing." },
    { id: "advice", label: "Practical & Grounded Guidance", desc: "Help me break down the problem into actionable small steps." },
    { id: "humour", label: "Light Humour & Distraction", desc: "Bring a gentle smile and remind me not to take life too heavily." },
    { id: "motivation", label: "Encouragement & Growth", desc: "Remind me of my strengths and push me forward constructively." }
  ];

  const handleToggleTrait = (trait) => {
    const lower = trait.toLowerCase();
    if (selectedTraits.includes(lower)) {
      setSelectedTraits(selectedTraits.filter(t => t !== lower));
    } else {
      setSelectedTraits([...selectedTraits, lower]);
    }
  };

  const handleAddPerson = () => {
    if (people.length < 5) {
      setPeople([...people, { name: "", ring: "close friend", note: "" }]);
    }
  };

  const handleUpdatePerson = (idx, field, val) => {
    const updated = [...people];
    updated[idx][field] = val;
    setPeople(updated);
  };

  const handleRemovePerson = (idx) => {
    setPeople(people.filter((_, i) => i !== idx));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast("Please choose an image under 4MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      // Resize with canvas to max 600px
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPhotoDataUrl(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Save questionnaire
      const filteredPeople = people.filter(p => p.name.trim().length > 0);
      const res = await profileAPI.saveQuestionnaire({
        display_name: displayName,
        wake_time: wakeTime,
        sleep_time: sleepTime,
        work_study_hours: workStudyHours,
        free_time: freeTime,
        personality_tags: selectedTraits,
        stresses,
        cheers,
        support_style: supportStyle,
        default_persona: "best_friend",
        people: filteredPeople,
        language
      });
      setProfile(res.data);

      // 2. Save guardian if teen
      if (isTeen && guardianName.trim()) {
        try {
          await guardianAPI.addGuardian({
            name: guardianName.trim(),
            contact: guardianContact.trim() || "parent@example.com"
          });
        } catch (e) {}
      }

      // 3. Save photo if uploaded
      if (photoDataUrl) {
        // Update profile photo_path with dataUrl
        try {
          await profileAPI.updateProfile({ photo_path: photoDataUrl });
        } catch (e) {}
      }

      showToast("Questionnaire completed! Now choose your voice.", "success");
      navigate("/personas");
    } catch (err) {
      showToast("Could not save answers. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepNames = [
    "Daily Routine",
    "About You",
    "Support Style",
    "Your Circle",
    "Your Name",
    ...(isTeen ? ["Family Care Link"] : []),
    "Mirror Photo"
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between p-4 md:p-10">
      {/* Top Header with Progress */}
      <div className="max-w-xl w-full mx-auto">
        <div className="flex items-center justify-between mb-4">
          <LogoMark size="sm" />
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="text-xs font-bold text-ink-muted hover:text-mirror-blue transition-colors"
          >
            Skip all & finish
          </button>
        </div>
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} stepNames={stepNames} />
      </div>

      {/* Main Question Card */}
      <div className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-card shadow-mirror-lg border border-cream-300 p-6 md:p-8">
          {/* STEP 1: ROUTINE */}
          {currentStep === 1 && (
            <div>
              <span className="text-[11px] font-bold text-mirror-blue uppercase tracking-wider">Step 1</span>
              <h2 className="text-xl md:text-2xl font-bold text-ink mt-1 mb-2">Tell Aaina about your daily rhythm</h2>
              <p className="text-xs text-ink-muted mb-6 leading-relaxed">
                Knowing when you rest and study helps Aaina reply with natural schedule awareness.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">Usual Wake-Up</label>
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-input border border-cream-300 text-sm font-semibold text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">Usual Bedtime</label>
                    <input
                      type="time"
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-input border border-cream-300 text-sm font-semibold text-ink"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Work or Study Hours</label>
                  <input
                    type="text"
                    value={workStudyHours}
                    onChange={(e) => setWorkStudyHours(e.target.value)}
                    placeholder="e.g. 09:00 - 17:00 classes"
                    className="w-full px-3 py-2.5 rounded-input border border-cream-300 text-sm text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">When do you usually have free time?</label>
                  <input
                    type="text"
                    value={freeTime}
                    onChange={(e) => setFreeTime(e.target.value)}
                    placeholder="e.g. Late evenings, Sunday afternoons"
                    className="w-full px-3 py-2.5 rounded-input border border-cream-300 text-sm text-ink"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ABOUT YOU */}
          {currentStep === 2 && (
            <div>
              <span className="text-[11px] font-bold text-lavender-dark uppercase tracking-wider">Step 2</span>
              <h2 className="text-xl md:text-2xl font-bold text-ink mt-1 mb-2">How would you describe yourself?</h2>
              <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                Select words that resonate with your personality and emotional world.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {traitsOptions.map((trait) => {
                  const isSelected = selectedTraits.includes(trait.toLowerCase());
                  return (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handleToggleTrait(trait)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-lavender-light border-lavender text-lavender-dark font-bold shadow-soft"
                          : "bg-white border-cream-300 text-ink-muted hover:border-cream-300"
                      }`}
                    >
                      {trait}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">What usually stresses or exhausts you?</label>
                  <input
                    type="text"
                    value={stresses}
                    onChange={(e) => setStresses(e.target.value)}
                    placeholder="e.g. Exams, public speaking, feeling lonely"
                    className="w-full px-3 py-2 rounded-input border border-cream-300 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">What brings you a smile or comfort?</label>
                  <input
                    type="text"
                    value={cheers}
                    onChange={(e) => setCheers(e.target.value)}
                    placeholder="e.g. Chai, rain, listening to music, talking to my friend"
                    className="w-full px-3 py-2 rounded-input border border-cream-300 text-xs text-ink"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUPPORT STYLE */}
          {currentStep === 3 && (
            <div>
              <span className="text-[11px] font-bold text-peach uppercase tracking-wider">Step 3</span>
              <h2 className="text-xl md:text-2xl font-bold text-ink mt-1 mb-2">What kind of support feels best?</h2>
              <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                When you're having a heavy day, how should Aaina show up for you?
              </p>

              <div className="space-y-3">
                {supportStyles.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setSupportStyle(style.id)}
                    className={`p-4 rounded-input border-2 cursor-pointer transition-all ${
                      supportStyle === style.id
                        ? "border-mirror-blue bg-mirror-light/40 shadow-soft"
                        : "border-cream-300 hover:border-mirror-blue/40 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-ink">{style.label}</h4>
                      {supportStyle === style.id && <Check className="w-4 h-4 text-mirror-blue stroke-[3]" />}
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">{style.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: YOUR CIRCLE */}
          {currentStep === 4 && (
            <div>
              <span className="text-[11px] font-bold text-mirror-blue uppercase tracking-wider">Step 4</span>
              <h2 className="text-xl md:text-2xl font-bold text-ink mt-1 mb-2">People in your world</h2>
              <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                Add a few important people in your life. Aaina uses this to gently nudge real-world connection—never replacing human relationships.
              </p>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {people.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-input bg-cream-50 border border-cream-300 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Name (e.g. Riya, Mom)"
                      value={p.name}
                      onChange={(e) => handleUpdatePerson(idx, "name", e.target.value)}
                      className="flex-1 bg-white px-2.5 py-1.5 rounded-input border border-cream-300 text-xs font-semibold text-ink"
                    />
                    <select
                      value={p.ring}
                      onChange={(e) => handleUpdatePerson(idx, "ring", e.target.value)}
                      className="bg-white px-2 py-1.5 rounded-input border border-cream-300 text-xs font-semibold text-ink"
                    >
                      <option value="close friend">Close Friend</option>
                      <option value="family">Family</option>
                      <option value="colleague">Colleague</option>
                    </select>
                    {people.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePerson(idx)}
                        className="text-ink-light hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {people.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPerson}
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-mirror-blue hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add another person</span>
                </button>
              )}
            </div>
          )}

          {/* STEP 5: PREFERRED NAME & LANGUAGE */}
          {currentStep === 5 && (
            <div>
              <span className="text-[11px] font-bold text-lavender-dark uppercase tracking-wider">Step 5</span>
              <h2 className="text-xl md:text-2xl font-bold text-ink mt-1 mb-2">What should Aaina call you?</h2>
              <p className="text-xs text-ink-muted mb-6 leading-relaxed">
                This is the name Aaina will use in handwritten replies and gentle check-ins.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Preferred Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Anushri"
                    className="w-full px-4 py-2.5 rounded-input border border-cream-300 text-sm font-bold text-ink focus:border-mirror-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Preferred Reply Language</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLanguage("english")}
                      className={`p-3 rounded-input border text-xs font-bold transition-all ${
                        language === "english"
                          ? "border-mirror-blue bg-mirror-light text-mirror-blue"
                          : "border-cream-300 bg-white text-ink-muted"
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage("hinglish")}
                      className={`p-3 rounded-input border text-xs font-bold transition-all ${
                        language === "hinglish"
                          ? "border-mirror-blue bg-mirror-light text-mirror-blue"
                          : "border-cream-300 bg-white text-ink-muted"
                      }`}
                    >
                      Hinglish (Casual Hindi-English)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6 (TEEN ONLY): FAMILY CARE LINK */}
          {isTeen && currentStep === 6 && (
            <div>
              <span className="text-[11px] font-bold text-peach uppercase tracking-wider">Family Care Link</span>
              <h2 className="text-xl md:text-2xl font-bold text-ink mt-1 mb-2">Gentle Guardian Support</h2>
              <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                Because you are under 16, Aaina includes Family Care Link. If you experience serious distress or repeated strain, Aaina will send a brief care reminder to a trusted parent or guardian.
              </p>

              <div className="p-3.5 rounded-input bg-lavender-light border border-lavender/30 text-xs text-lavender-dark mb-4">
                <strong>Our Privacy Guarantee:</strong> Parents will NEVER see your diary entries, feelings, or secrets. Only a gentle note to check in on you kindly.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Parent or Guardian Name</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Pooja Mehta"
                    className="w-full px-3 py-2 rounded-input border border-cream-300 text-xs font-semibold text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Parent Phone or Email</label>
                  <input
                    type="text"
                    value={guardianContact}
                    onChange={(e) => setGuardianContact(e.target.value)}
                    placeholder="e.g. pooja@example.com or +91 98765 43210"
                    className="w-full px-3 py-2 rounded-input border border-cream-300 text-xs font-semibold text-ink"
                  />
                </div>
                <label className="flex items-center gap-2 pt-1 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianConsent}
                    onChange={(e) => setGuardianConsent(e.target.checked)}
                    className="rounded text-mirror-blue"
                  />
                  <span>I understand how Family Care Link protects my privacy while keeping me safe.</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 6/7: MIRROR REVEAL PHOTO */}
          {((!isTeen && currentStep === 6) || (isTeen && currentStep === 7)) && (
            <div className="text-center">
              <span className="text-[11px] font-bold text-mirror-blue uppercase tracking-wider">Mirror Reveal</span>
              <h2 className="text-xl md:text-2xl font-bold text-ink mt-1 mb-2">See yourself in the mirror</h2>
              <p className="text-xs text-ink-muted mb-6 max-w-md mx-auto leading-relaxed">
                Upload your photo for the interactive frosted mirror. When you move your cursor or finger over the glass, your reflection appears. (Stored locally; never sent to any AI).
              </p>

              <div className="flex flex-col items-center justify-center mb-6">
                {photoDataUrl ? (
                  <div className="relative w-36 h-48 rounded-t-full rounded-b-2xl overflow-hidden shadow-mirror border-2 border-mirror-blue">
                    <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoDataUrl(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-white text-rose-500 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="w-36 h-48 rounded-t-full rounded-b-2xl border-2 border-dashed border-cream-300 bg-cream-50 hover:bg-cream-100 flex flex-col items-center justify-center p-4 cursor-pointer transition-colors shadow-soft">
                    <Camera className="w-8 h-8 text-mirror-blue mb-2" />
                    <span className="text-xs font-bold text-ink">Upload Photo</span>
                    <span className="text-[10px] text-ink-muted mt-0.5">JPG / PNG</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-cream-200 mt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-button text-xs font-bold text-ink-muted hover:text-ink tap-target"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-button bg-mirror-blue hover:bg-mirror-hover text-white text-xs font-bold shadow-mirror transition-all active:scale-95 tap-target"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-7 py-3 rounded-button bg-mirror-blue hover:bg-mirror-hover text-white text-sm font-bold shadow-mirror transition-all active:scale-95 disabled:opacity-50 tap-target"
              >
                <span>{isSubmitting ? "Personalizing Aaina..." : "Complete & Pick Voice"}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-ink-light">
        Every question is optional. You can update your answers anytime in Me.
      </footer>
    </div>
  );
}
