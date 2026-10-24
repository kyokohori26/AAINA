import React, { useState, useEffect } from "react";
import { Search, Trash2, ChevronDown, ChevronUp, BookOpen, Sparkles, Filter, Camera } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import { getMoodById, MOODS } from "../utils/moods";
import { getPersonaById } from "../utils/personas";
import { diaryAPI } from "../services/api";
import { useUserStore } from "../store/userStore";

export default function History() {
  const { showToast } = useUserStore();
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, [selectedMoodFilter]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedMoodFilter !== "all") params.mood = selectedMoodFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();
      const res = await diaryAPI.getEntries(params);
      setEntries(res.data);
    } catch (e) {
      showToast("Could not load past entries.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEntries();
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await diaryAPI.deleteEntry(deleteTargetId);
      setEntries(entries.filter((e) => e.id !== deleteTargetId));
      showToast("Entry removed from your diary.", "success");
    } catch (e) {
      showToast("Could not delete entry.", "error");
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-ink">Past Entries</h1>
        <p className="text-xs md:text-sm text-ink-muted mt-1">
          Search your thoughts, revisit reflections, and see what you overcame.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-ink-light absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by keyword or thought..."
            className="w-full pl-10 pr-4 py-2.5 rounded-card bg-white border border-cream-300 text-sm font-medium text-ink focus:border-mirror-blue outline-none shadow-soft"
          />
        </form>

        {/* Mood Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedMoodFilter("all")}
            className={`px-3 py-1.5 rounded-full border font-semibold transition-all flex-shrink-0 tap-target ${
              selectedMoodFilter === "all"
                ? "bg-mirror-blue text-white border-mirror-blue shadow-sm"
                : "bg-white text-ink-muted border-cream-300 hover:bg-cream-100"
            }`}
          >
            All Moods
          </button>
          {MOODS.map((m) => {
            const isActive = selectedMoodFilter === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMoodFilter(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-semibold transition-all flex-shrink-0 tap-target ${
                  isActive
                    ? "bg-white border-mirror-blue shadow-sm font-bold scale-105"
                    : "bg-white text-ink-muted border-cream-300 hover:bg-cream-100"
                }`}
              >
                <span>{m.emoji}</span>
                <span className="capitalize">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-ink-muted">
          Loading your pages...
        </div>
      ) : entries.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-cream-300 shadow-soft">
          <BookOpen className="w-10 h-10 text-cream-300 mx-auto mb-2.5" />
          <h3 className="text-base font-bold text-ink">No entries found</h3>
          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or mood filter, or write a new entry today.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((item) => {
            const mood = getMoodById(item.mood_label);
            const persona = getPersonaById(item.persona_used);
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-card bg-white border border-cream-300 shadow-soft hover:shadow-mirror transition-all overflow-hidden"
              >
                {/* Entry Card Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-ink">{item.date}</span>
                      <span
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1"
                        style={{ borderColor: mood.color, color: "#2B2D42" }}
                      >
                        <span>{mood.emoji}</span>
                        <span className="capitalize">{mood.label}</span>
                      </span>
                      {item.photo_thumbnail && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-mirror-light text-mirror-blue border border-mirror-blue/30 flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          <span>Photo Diary</span>
                        </span>
                      )}
                      <span className="text-[11px] text-ink-light">
                        Replied by {persona.name}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      {item.photo_thumbnail && (
                        <img
                          src={item.photo_thumbnail}
                          alt="Photo thumbnail"
                          className="w-12 h-12 rounded-input object-cover border border-cream-300 shadow-soft shrink-0"
                        />
                      )}
                      <p className="text-sm font-medium text-ink-muted leading-relaxed line-clamp-2">
                        {item.preview}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetId(item.id);
                      }}
                      className="p-2 text-ink-light hover:text-rose-500 hover:bg-rose-50 rounded-button transition-colors tap-target"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-ink-muted rounded-button hover:bg-cream-100 transition-colors tap-target"
                      aria-label="Expand entry"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Full View */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-cream-200 bg-cream-50/40 animate-fade-in space-y-4">
                    {/* Full Entry Text */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">
                        Your Written Words:
                      </span>
                      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-input border border-cream-200">
                        {item.full_text}
                      </p>
                    </div>

                    {/* Aaina's Reply */}
                    {item.latest_reply && (
                      <div>
                        <span className="text-[10px] font-bold text-mirror-blue uppercase tracking-wider block mb-1">
                          Aaina's Reply ({persona.name}):
                        </span>
                        <div className="p-4 rounded-input bg-white border border-cream-200">
                          <p className="font-handwriting text-2xl font-semibold text-ink leading-relaxed">
                            "{item.latest_reply.text}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete this diary entry?"
        message="This will permanently delete your entry and Aaina's reply. This action cannot be undone."
        confirmLabel="Yes, delete"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
