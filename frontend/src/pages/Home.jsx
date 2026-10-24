import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PenTool, Sparkles, BookOpen, Clock, Heart, LifeBuoy, ChevronRight, Calendar } from "lucide-react";
import MoodPicker from "../components/MoodPicker";
import MirrorReveal from "../components/MirrorReveal";
import NudgeBanner from "../components/NudgeBanner";
import { getTimeGreeting, formatDate } from "../utils/format";
import { getPersonaById } from "../utils/personas";
import { getMoodById } from "../utils/moods";
import { diaryAPI, nudgeAPI } from "../services/api";
import { useUserStore } from "../store/userStore";
import { useDiaryStore } from "../store/diaryStore";

export default function Home() {
  const navigate = useNavigate();
  const { user, profile, showToast } = useUserStore();
  const { setSelectedMood, pendingNudge, setPendingNudge } = useDiaryStore();

  const [latestEntry, setLatestEntry] = useState(null);
  const [totalEntriesCount, setTotalEntriesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const displayName = profile?.display_name || user?.name?.split(" ")[0] || "Friend";

  useEffect(() => {
    loadHomeData();
  }, [user]);

  const loadHomeData = async () => {
    try {
      const [entriesRes, nudgeRes] = await Promise.all([
        diaryAPI.getEntries({ limit: 1 }),
        nudgeAPI.getPending().catch(() => ({ data: null }))
      ]);

      if (entriesRes.data && entriesRes.data.length > 0) {
        setLatestEntry(entriesRes.data[0]);
      }
      setTotalEntriesCount(entriesRes.data ? entriesRes.data.length : 0);

      if (nudgeRes.data) {
        setPendingNudge(nudgeRes.data);
      }
    } catch (e) {
      // Quiet fail for empty states
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMoodCheckIn = (moodId) => {
    if (!moodId) return;
    setSelectedMood(moodId);
    navigate(`/diary?mood=${moodId}`);
  };

  const handleSimulateNudge = async (days) => {
    try {
      const res = await nudgeAPI.simulate(days);
      setPendingNudge(res.data);
      showToast("Check-in nudge simulated! Notice how warmly Aaina checks in.", "success");
    } catch (e) {
      showToast("Could not simulate nudge.", "error");
    }
  };

  const latestPersona = latestEntry ? getPersonaById(latestEntry.persona_used) : null;
  const latestMood = latestEntry ? getMoodById(latestEntry.mood_label) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Check-in Inactivity Nudge Banner */}
      <NudgeBanner
        nudge={pendingNudge}
        onDismiss={() => setPendingNudge(null)}
        onSimulate={handleSimulateNudge}
      />

      {/* Greeting Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink">
            {getTimeGreeting(displayName)}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            How is your heart feeling today?
          </p>
        </div>

        {/* Gentle Days Shown-Up Counter */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-200/70 border border-cream-300 text-xs font-semibold text-ink-muted">
          <Calendar className="w-3.5 h-3.5 text-mirror-blue" />
          <span>You've shown up for yourself {Math.max(1, totalEntriesCount)} days</span>
        </div>
      </div>

      {/* Quick Mood Check-In Row */}
      <div className="p-4 md:p-5 rounded-card bg-white border border-cream-300 shadow-soft">
        <p className="text-xs font-bold text-ink-muted mb-2">
          Quick Emotional Check-in:
        </p>
        <MoodPicker onSelectMood={handleQuickMoodCheckIn} />
      </div>

      {/* Main Two-Column Row: Mirror Card & Action Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Mirror Reveal Feature Card */}
        <div className="p-6 rounded-card bg-white border border-cream-300 shadow-soft flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold text-mirror-blue uppercase tracking-wider mb-2">
            The Mirror
          </span>
          <p className="text-xs text-ink-muted mb-4 max-w-xs">
            Move your cursor or touch over the glass to reveal your reflection.
          </p>
          <MirrorReveal
            photoUrl={profile?.photo_path}
            userDisplayName={displayName}
          />
        </div>

        {/* Big Write Entry CTA & Overview */}
        <div className="p-6 rounded-card bg-gradient-to-br from-white via-cream-50 to-mirror-light/40 border border-cream-300 shadow-soft flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mirror-light text-mirror-blue text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Today's Blank Canvas</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-ink mb-2">
              Have something on your mind?
            </h2>
            <p className="text-xs md:text-sm text-ink-muted leading-relaxed mb-6">
              Aaina is ready to listen without judging or rushing to fix anything. Take a quiet minute for yourself.
            </p>
          </div>

          <Link
            to="/diary"
            className="flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-button bg-mirror-blue hover:bg-mirror-hover text-white font-bold text-base shadow-mirror hover:shadow-mirror-lg transition-all active:scale-98 tap-target"
          >
            <PenTool className="w-5 h-5" />
            <span>Write Today's Entry</span>
          </Link>
        </div>
      </div>

      {/* Latest Reply from Aaina Card */}
      {latestEntry && latestEntry.latest_reply && (
        <div className="p-5 md:p-6 rounded-card bg-white border border-cream-300 shadow-soft">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-ink">
              <BookOpen className="w-4 h-4 text-mirror-blue" />
              <span>Latest reply from {latestPersona?.name || "Aaina"}</span>
              <span className="text-ink-light">• {formatDate(latestEntry.created_at)}</span>
            </div>
            {latestMood && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border" style={{ borderColor: latestMood.color, color: "#2B2D42" }}>
                {latestMood.emoji} {latestMood.label}
              </span>
            )}
          </div>

          <div className="bg-cream-50/60 p-4 rounded-input border border-cream-200 mb-3">
            <p className="font-handwriting text-2xl font-semibold text-ink leading-relaxed">
              "{latestEntry.latest_reply.text}"
            </p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <p className="text-ink-muted truncate max-w-xs italic">
              From your entry: "{latestEntry.preview}"
            </p>
            <Link
              to={`/history`}
              className="font-bold text-mirror-blue hover:underline flex items-center gap-1 flex-shrink-0"
            >
              <span>View full conversation</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Footer Support Link */}
      <div className="text-center pt-4">
        <Link
          to="/safety"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-lavender-dark transition-colors font-medium"
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Need immediate emotional support or someone to talk to? Free Helplines &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
