import React from "react";
import { MOODS } from "../utils/moods";

export default function MoodPicker({ selectedMood, onSelectMood, size = "md", showLabel = true }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      {MOODS.map((mood) => {
        const isSelected = selectedMood === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            onClick={() => onSelectMood(isSelected ? null : mood.id)}
            aria-label={`Select mood: ${mood.label}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all tap-target flex-shrink-0 ${
              isSelected
                ? "border-mirror-blue bg-white shadow-mirror font-bold scale-105"
                : "border-cream-300 bg-white/70 hover:bg-white hover:border-cream-300 text-ink-muted"
            }`}
          >
            <span className="text-xl" role="img" aria-label={mood.label}>
              {mood.emoji}
            </span>
            {showLabel && (
              <span className="text-xs font-semibold capitalize" style={{ color: isSelected ? "#2B2D42" : undefined }}>
                {mood.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
