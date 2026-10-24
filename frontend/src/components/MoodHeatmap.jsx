import React from "react";
import { getMoodById } from "../utils/moods";

export default function MoodHeatmap({ heatmap = [] }) {
  if (!heatmap || heatmap.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-ink-muted">
        No calendar activity to display yet.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
        {heatmap.map((day, idx) => {
          const mood = day.has_entry ? getMoodById(day.mood_label) : null;
          return (
            <div
              key={idx}
              title={day.has_entry ? `${day.date}: ${mood.label} (${mood.emoji})` : `${day.date}: No entry`}
              className="group relative flex flex-col items-center justify-center aspect-square rounded-input border transition-all cursor-pointer hover:scale-110"
              style={{
                backgroundColor: day.has_entry ? mood.color : "#F3EDE2",
                borderColor: day.has_entry ? mood.color : "#ECE6DC",
                opacity: day.has_entry ? 0.9 : 0.6
              }}
            >
              {day.has_entry ? (
                <span className="text-sm select-none">{mood.emoji}</span>
              ) : (
                <span className="text-[10px] text-ink-light select-none">
                  {new Date(day.date).getDate()}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-cream-200 text-[11px] text-ink-muted">
        <span className="font-bold text-ink">Moods:</span>
        {["calm", "happy", "anxious", "sad", "angry", "tired"].map((mId) => {
          const m = getMoodById(mId);
          return (
            <div key={mId} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="capitalize">{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
