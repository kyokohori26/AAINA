import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, TrendingUp, Info } from "lucide-react";
import MoodChart from "../components/MoodChart";
import MoodHeatmap from "../components/MoodHeatmap";
import { getMoodById } from "../utils/moods";
import { moodAPI } from "../services/api";
import { useUserStore } from "../store/userStore";

export default function Mood() {
  const { showToast } = useUserStore();
  const [range, setRange] = useState("week");
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMoodData();
  }, [range]);

  const fetchMoodData = async () => {
    setIsLoading(true);
    try {
      const res = await moodAPI.getSummary(range);
      setSummaryData(res.data);
    } catch (e) {
      showToast("Could not load mood analytics.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const dominantMoodObj = summaryData ? getMoodById(summaryData.dominant_mood) : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Title & Range Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink">Mood Timeline</h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1">
            See your emotional rhythms, identify patterns, and honor how you feel.
          </p>
        </div>

        {/* Range Toggle */}
        <div className="p-1 rounded-full bg-cream-200 border border-cream-300 inline-flex">
          <button
            onClick={() => setRange("week")}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all tap-target ${
              range === "week" ? "bg-white text-mirror-blue shadow-sm" : "text-ink-muted hover:text-ink"
            }`}
          >
            Past Week
          </button>
          <button
            onClick={() => setRange("month")}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all tap-target ${
              range === "month" ? "bg-white text-mirror-blue shadow-sm" : "text-ink-muted hover:text-ink"
            }`}
          >
            Past Month
          </button>
        </div>
      </div>

      {/* Dominant Mood Highlight Banner */}
      {dominantMoodObj && summaryData?.total_entries > 0 && (
        <div className="p-4 rounded-card bg-gradient-to-r from-mirror-light via-cream-50 to-lavender-light border border-cream-300 shadow-soft flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{dominantMoodObj.emoji}</span>
            <div>
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Dominant Rhythm</span>
              <h3 className="text-base font-bold text-ink capitalize">
                Mostly Feeling {dominantMoodObj.label}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-mirror-blue">{summaryData.total_entries} entries</span>
            <p className="text-[10px] text-ink-muted">in this timeframe</p>
          </div>
        </div>
      )}

      {/* Trend Chart Card */}
      <div className="p-6 rounded-card bg-white border border-cream-300 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-mirror-blue" />
            <span>Emotional Wave Intensity (1 to 5)</span>
          </h3>
          <span className="text-[11px] text-ink-muted font-semibold">
            {range === "week" ? "Last 7 Days" : "Last 30 Days"}
          </span>
        </div>
        <MoodChart timeline={summaryData?.timeline || []} />
      </div>

      {/* Calendar Heatmap Card */}
      <div className="p-6 rounded-card bg-white border border-cream-300 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Calendar className="w-4 h-4 text-mirror-blue" />
            <span>Monthly Activity & Mood Heatmap</span>
          </h3>
          <span className="text-[11px] text-ink-muted font-semibold">Past 30 Days</span>
        </div>
        <MoodHeatmap heatmap={summaryData?.heatmap || []} />
      </div>

      {/* Aaina Pattern Insights */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-lavender-dark" />
          <span>Gentle Pattern Reflections</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {summaryData?.insights?.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-card bg-white border border-cream-300 shadow-soft"
            >
              <span className="text-[10px] font-bold text-mirror-blue uppercase tracking-wider block mb-1">
                {insight.type}
              </span>
              <h4 className="text-xs font-bold text-ink mb-1.5 leading-snug">
                {insight.title}
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
