import React, { useState } from "react";
import { Heart, Compass, Sparkles, Sun, Award, Check, Volume2 } from "lucide-react";

export default function PersonaCard({ persona, isSelected, onSelect }) {
  const [showPreview, setShowPreview] = useState(false);

  const iconMap = {
    Heart: Heart,
    Compass: Compass,
    Sparkles: Sparkles,
    Sun: Sun,
    Award: Award
  };
  const IconComponent = iconMap[persona.iconName] || Sparkles;

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-card p-5 border-2 transition-all duration-200 bg-white ${
        isSelected
          ? "border-mirror-blue shadow-mirror-lg scale-[1.02]"
          : "border-cream-300 hover:border-mirror-blue/50 shadow-soft hover:shadow-mirror"
      }`}
    >
      {/* Top selection checkmark */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-mirror-blue text-white flex items-center justify-center shadow-sm">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      )}

      {/* Persona Header */}
      <div className="flex items-center gap-3.5 mb-3">
        <div className={`w-12 h-12 rounded-full border flex items-center justify-center flex-shrink-0 ${persona.avatarBg}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-ink">{persona.name}</h4>
          <p className="text-xs font-semibold text-mirror-blue">{persona.tone}</p>
        </div>
      </div>

      <p className="text-xs text-ink-muted leading-relaxed mb-4">
        {persona.description}
      </p>

      {/* Preview Accordion Button */}
      <div className="border-t border-cream-200 pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowPreview(!showPreview);
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-mirror-blue transition-colors"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{showPreview ? "Hide sample voice" : "Preview sample reply"}</span>
        </button>

        {showPreview && (
          <div className="mt-2 p-3 rounded-input bg-cream-50 border border-cream-300">
            <p className="font-handwriting text-base text-ink leading-snug">
              "{persona.preview}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
