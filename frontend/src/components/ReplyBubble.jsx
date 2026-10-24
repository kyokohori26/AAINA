import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, RefreshCw, Send, MessageSquare, Sparkles, Camera, Cpu, AlertCircle } from "lucide-react";
import { getPersonaById, PERSONAS } from "../utils/personas";
import { getMoodById } from "../utils/moods";
import { diaryAPI } from "../services/api";
import { useUserStore } from "../store/userStore";

export default function ReplyBubble({
  entry,
  replies = [],
  moodLabel = "calm",
  onRegenerate,
  onReplyAdded
}) {
  const { showToast } = useUserStore();
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [followUpText, setFollowUpText] = useState("");
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);

  // Find the primary/latest Aaina reply
  const aainaReplies = replies.filter(r => r.role === "aaina");
  const latestAainaReply = aainaReplies.length > 0 ? aainaReplies[aainaReplies.length - 1] : null;
  const fullReplyText = latestAainaReply?.text || "";
  const personaUsed = latestAainaReply?.persona || entry?.persona_used || "best_friend";
  const personaObj = getPersonaById(personaUsed);
  const moodObj = getMoodById(moodLabel);

  // AI Provider metadata
  const isFallback = Boolean(latestAainaReply?.ai_fallback ?? entry?.ai_fallback);
  const aiProvider = latestAainaReply?.ai_provider || entry?.ai_provider || "gemma";

  // Typing animation effect
  useEffect(() => {
    if (!fullReplyText) return;
    setDisplayedText("");
    setIsTyping(true);

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 2;
      if (currentIndex >= fullReplyText.length) {
        setDisplayedText(fullReplyText);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayedText(fullReplyText.slice(0, currentIndex));
      }
    }, 18);

    return () => clearInterval(interval);
  }, [fullReplyText]);

  const handleFeedback = async (helpful) => {
    try {
      if (entry?.id) {
        await diaryAPI.submitFeedback(entry.id, helpful);
        setFeedbackGiven(helpful);
        showToast(helpful ? "Thank you! Aaina will remember this." : "Thanks for the feedback. Aaina will adjust.", "success");
      }
    } catch (e) {
      showToast("Could not submit feedback.", "error");
    }
  };

  const handleSendFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpText.trim() || !entry?.id) return;
    setIsSendingFollowUp(true);
    try {
      const res = await diaryAPI.continueConversation(entry.id, followUpText.trim(), personaUsed);
      setFollowUpText("");
      if (onReplyAdded) onReplyAdded(res.data);
      showToast("Aaina heard you.", "success");
    } catch (err) {
      showToast("Could not send reply.", "error");
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  return (
    <div className="rounded-card bg-gradient-to-b from-white to-cream-50 border border-cream-300 shadow-mirror p-6 my-6 animate-fade-in relative overflow-hidden">
      {/* Top Header: Persona name + Detected mood badge + Gemma badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${personaObj.avatarBg}`}>
            {personaObj.name[0]}
          </div>
          <div>
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <span>{personaObj.name}</span>
              <span className="text-[10px] text-ink-muted font-normal">• Aaina Companion</span>
            </span>
            <p className="text-[11px] text-ink-muted">{personaObj.tone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Detected Mood badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold"
            style={{
              backgroundColor: `${moodObj.color}20`,
              borderColor: moodObj.color,
              color: "#2B2D42"
            }}
          >
            <span>{moodObj.emoji}</span>
            <span className="capitalize">{moodObj.label}</span>
          </div>
        </div>
      </div>

      {/* Optional Photo Thumbnail with the reply */}
      {entry?.photo_thumbnail && (
        <div className="mb-4 flex items-center gap-3 p-2.5 rounded-input bg-cream-100/70 border border-cream-200 max-w-sm">
          <img
            src={entry.photo_thumbnail}
            alt="Diary photo thumbnail"
            className="w-14 h-14 rounded-input object-cover border border-white shadow-soft"
          />
          <div className="min-w-0">
            <span className="text-xs font-bold text-ink flex items-center gap-1">
              <Camera className="w-3 h-3 text-mirror-blue" />
              <span>Photo Diary Entry</span>
            </span>
            <p className="text-[11px] text-ink-muted truncate">
              Multimodal diary reflection
            </p>
          </div>
        </div>
      )}

      {/* Handwriting Reply Note */}
      <div className="min-h-[90px] py-2">
        <p className="font-handwriting text-2xl md:text-3xl font-semibold text-ink leading-relaxed">
          {displayedText}
          {isTyping && <span className="inline-block w-1.5 h-6 bg-mirror-blue ml-1 animate-pulse" />}
        </p>
      </div>

      {/* Previous conversation back-and-forth history if any */}
      {replies.length > 2 && (
        <div className="mt-4 pt-4 border-t border-cream-200 space-y-3">
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Earlier in this thread</p>
          {replies.slice(1, -1).map((r, i) => (
            <div
              key={r.id || i}
              className={`p-3 rounded-input text-xs ${
                r.role === "user"
                  ? "bg-mirror-light text-ink ml-6 font-semibold"
                  : "bg-white border border-cream-200 mr-6 font-handwriting text-xl"
              }`}
            >
              {r.text}
            </div>
          ))}
        </div>
      )}

      {/* Action Toolbar */}
      {!isTyping && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-cream-200 mt-4">
          {/* Reaction Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-ink-muted text-[11px] font-medium mr-1">Was this reply comforting?</span>
            <button
              onClick={() => handleFeedback(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all tap-target ${
                feedbackGiven === true
                  ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                  : "border-cream-300 bg-white hover:bg-cream-100 text-ink-muted"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>This helped</span>
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all tap-target ${
                feedbackGiven === false
                  ? "bg-rose-100 border-rose-300 text-rose-800"
                  : "border-cream-300 bg-white hover:bg-cream-100 text-ink-muted"
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Not quite</span>
            </button>
          </div>

          {/* Change Voice (Regenerate) */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cream-300 bg-white hover:border-mirror-blue text-xs font-bold text-mirror-blue transition-colors tap-target"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change voice</span>
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 bottom-full mb-2 bg-white rounded-card shadow-mirror-lg border border-cream-300 p-2 w-48 z-40">
                <p className="text-[10px] font-bold text-ink-muted px-2 py-1 uppercase">Switch Voice</p>
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setShowPersonaMenu(false);
                      if (onRegenerate) onRegenerate(p.id);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-input text-xs font-semibold hover:bg-mirror-light hover:text-mirror-blue flex items-center justify-between ${
                      p.id === personaUsed ? "text-mirror-blue font-bold bg-mirror-light/50" : "text-ink"
                    }`}
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue Talking Input */}
      {!isTyping && (
        <form onSubmit={handleSendFollowUp} className="mt-4 pt-3 flex items-center gap-2">
          <input
            type="text"
            value={followUpText}
            onChange={(e) => setFollowUpText(e.target.value)}
            placeholder="Reply back or talk more with Aaina..."
            className="flex-1 bg-white border border-cream-300 rounded-button px-4 py-2.5 text-xs font-medium text-ink focus:border-mirror-blue outline-none"
          />
          <button
            type="submit"
            disabled={isSendingFollowUp || !followUpText.trim()}
            className="px-4 py-2.5 rounded-button bg-mirror-blue text-white text-xs font-bold hover:bg-mirror-hover disabled:opacity-50 transition-colors flex items-center gap-1.5 tap-target"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      )}
    </div>
  );
}
