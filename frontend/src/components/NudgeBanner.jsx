import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, Clock } from "lucide-react";
import { nudgeAPI } from "../services/api";

export default function NudgeBanner({ nudge, onDismiss, onSimulate }) {
  const handleDismiss = async () => {
    if (nudge?.id) {
      try {
        await nudgeAPI.dismiss(nudge.id);
      } catch (e) {}
    }
    onDismiss();
  };

  if (!nudge) {
    return (
      <div className="flex items-center justify-between p-3 rounded-card bg-cream-50 border border-cream-200 mb-6 text-xs">
        <span className="text-ink-muted flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-mirror-blue" />
          Aaina notices when you go quiet, kindly.
        </span>
        <button
          onClick={() => onSimulate(4)}
          className="px-2.5 py-1 rounded-full bg-white border border-cream-300 text-mirror-blue hover:bg-mirror-light font-bold text-[11px] shadow-sm transition-all"
        >
          Simulate 4 days away ✨
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-4 rounded-card bg-gradient-to-r from-mirror-light via-cream-50 to-lavender-light border border-mirror-blue/30 shadow-mirror mb-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-mirror-blue shadow-soft flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-mirror-blue">
              Gentle Check-in
            </span>
            <p className="text-sm font-semibold text-ink mt-0.5 leading-snug">
              "{nudge.message}"
            </p>
            <div className="flex items-center gap-4 mt-2.5">
              <Link
                to="/diary"
                className="text-xs font-bold text-mirror-blue hover:underline"
              >
                Write an entry &rarr;
              </Link>
              <button
                onClick={handleDismiss}
                className="text-xs font-medium text-ink-muted hover:text-ink"
              >
                I'm okay, thanks
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-ink-muted hover:text-ink p-1 -mr-1 -mt-1"
          aria-label="Dismiss check-in"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
