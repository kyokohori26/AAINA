import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import LogoMark from "../components/LogoMark";
import PersonaCard from "../components/PersonaCard";
import { PERSONAS } from "../utils/personas";
import { profileAPI } from "../services/api";
import { useUserStore } from "../store/userStore";
import { useDiaryStore } from "../store/diaryStore";

export default function PersonaPicker() {
  const navigate = useNavigate();
  const { profile, setProfile, showToast } = useUserStore();
  const { setSelectedPersona } = useDiaryStore();

  const [selected, setSelected] = useState(profile?.default_persona || "best_friend");
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirmPersona = async () => {
    setIsSaving(true);
    try {
      const res = await profileAPI.updateProfile({ default_persona: selected });
      setProfile(res.data);
      setSelectedPersona(selected);
      showToast("Voice archetype selected! Welcome home.", "success");
      navigate("/home");
    } catch (e) {
      showToast("Could not update persona. Proceeding to home.", "info");
      navigate("/home");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between p-4 md:p-10">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between mb-4">
        <LogoMark size="sm" />
        <span className="text-xs font-semibold text-ink-muted">Step 2 of 2</span>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full mx-auto my-auto py-6">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold text-mirror-blue uppercase tracking-wider">
            Choose Your Voice
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-ink mt-1.5 mb-2">
            How should Aaina speak with you?
          </h1>
          <p className="text-xs md:text-sm text-ink-muted max-w-lg mx-auto leading-relaxed">
            Pick a default archetype. Aaina uses this tone for replies and reflections. You can preview sample notes or change your voice per entry anytime.
          </p>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PERSONAS.map((p) => (
            <PersonaCard
              key={p.id}
              persona={p}
              isSelected={selected === p.id}
              onSelect={() => setSelected(p.id)}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleConfirmPersona}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-button bg-mirror-blue hover:bg-mirror-hover text-white font-bold text-sm shadow-mirror hover:shadow-mirror-lg transition-all active:scale-95 disabled:opacity-50 tap-target"
          >
            <span>{isSaving ? "Setting Voice..." : "Set as Default Voice & Start Journaling"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-ink-light">
        Aaina's voices are psychological archetypes designed to offer compassionate companionship.
      </footer>
    </div>
  );
}
