import React from "react";
import { Trash2, Brain, Sparkles } from "lucide-react";
import { formatDate } from "../utils/format";

export default function MemoryList({ memories = [], onDeleteMemory }) {
  if (!memories || memories.length === 0) {
    return (
      <div className="p-8 text-center bg-cream-50 rounded-card border border-cream-200">
        <Brain className="w-10 h-10 text-lavender mx-auto mb-2.5" />
        <p className="text-sm font-bold text-ink">No memories stored yet</p>
        <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
          As you write diary entries, Aaina gently remembers recurring routines, exams, and people you mention to reply with real understanding.
        </p>
      </div>
    );
  }

  const categoryColors = {
    routine: "bg-blue-50 text-blue-700 border-blue-200",
    exam: "bg-purple-50 text-purple-700 border-purple-200",
    event: "bg-amber-50 text-amber-700 border-amber-200",
    person: "bg-rose-50 text-rose-700 border-rose-200",
    preference: "bg-emerald-50 text-emerald-700 border-emerald-200",
    general: "bg-cream-100 text-ink-muted border-cream-300"
  };

  return (
    <div className="space-y-3">
      {memories.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between gap-3 p-4 rounded-card bg-white border border-cream-300 shadow-soft hover:shadow-mirror transition-all"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${categoryColors[item.category] || categoryColors.general}`}>
                {item.category}
              </span>
              <span className="text-[11px] text-ink-light">
                {formatDate(item.created_at)}
              </span>
            </div>
            <p className="text-sm font-semibold text-ink leading-relaxed">
              {item.fact_text}
            </p>
          </div>

          <button
            onClick={() => onDeleteMemory(item.id)}
            aria-label="Forget this memory"
            title="Forget this memory"
            className="p-2 rounded-button text-ink-light hover:text-rose-500 hover:bg-rose-50 transition-colors tap-target flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
