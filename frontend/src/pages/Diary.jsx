import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DiaryEditor from "../components/DiaryEditor";
import ReplyBubble from "../components/ReplyBubble";
import ParentAlertModal from "../components/ParentAlertModal";
import { diaryAPI } from "../services/api";
import { useUserStore } from "../store/userStore";
import { useDiaryStore } from "../store/diaryStore";

export default function Diary() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, showToast } = useUserStore();
  const {
    draftText,
    setDraftText,
    selectedPersona,
    setSelectedPersona,
    selectedMode,
    setSelectedMode,
    selectedMood,
    setSelectedMood,
    attachedPhotoFile,
    photoPreviewUrl,
    setAttachedPhoto,
    clearAttachedPhoto,
    currentEntry,
    setCurrentEntry,
    isGeneratingReply,
    setIsGeneratingReply,
    parentAlertModal,
    setParentAlertModal,
    resetDraft
  } = useDiaryStore();

  const [activeEntry, setActiveEntry] = useState(null);

  // Sync initial query params (e.g. if arriving from Home mood checkin)
  useEffect(() => {
    const queryMood = searchParams.get("mood");
    if (queryMood) {
      setSelectedMood(queryMood);
    }
    if (profile?.default_persona && !selectedPersona) {
      setSelectedPersona(profile.default_persona);
    }
  }, [searchParams, profile]);

  const handleSubmitEntry = async () => {
    if (!draftText.trim() && !attachedPhotoFile) {
      showToast("Please write something or attach a photo before sending.", "error");
      return;
    }

    setIsGeneratingReply(true);
    try {
      let res;
      if (attachedPhotoFile) {
        const formData = new FormData();
        formData.append("text", draftText.trim());
        formData.append("persona", selectedPersona || "best_friend");
        formData.append("mode", selectedMode || "listen");
        if (selectedMood) {
          formData.append("mood", selectedMood);
        }
        formData.append("photo", attachedPhotoFile);
        res = await diaryAPI.createEntry(formData);
      } else {
        res = await diaryAPI.createEntry({
          text: draftText.trim(),
          persona: selectedPersona || "best_friend",
          mode: selectedMode || "listen",
          mood: selectedMood
        });
      }

      const entryData = res.data;
      setActiveEntry(entryData);
      setCurrentEntry(entryData);
      resetDraft();

      // Check if HIGH RISK triggered
      if (entryData.risk_level === "high" || entryData.crisis_payload) {
        showToast("We care deeply about your safety.", "error");
        navigate("/safety");
        return;
      }

      // Check if Family Care Link triggered for under 16 user
      if (entryData.parent_alert && entryData.parent_alert.alert_triggered) {
        setParentAlertModal(entryData.parent_alert);
      }

      showToast("Aaina received your entry and replied.", "success");
    } catch (err) {
      const msg = err.response?.data?.detail || "Could not save entry. Please try again.";
      showToast(msg, "error");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleRegenerateVoice = async (newPersona) => {
    if (!activeEntry?.id) return;
    try {
      const res = await diaryAPI.regenerateReply(activeEntry.id, newPersona);
      // Append new reply to replies list
      const updatedReplies = [...activeEntry.replies, res.data];
      const updatedEntry = { ...activeEntry, persona_used: newPersona, replies: updatedReplies };
      setActiveEntry(updatedEntry);
      setCurrentEntry(updatedEntry);
      showToast(`Regenerated reply in ${res.data.persona.replace("_", " ")} voice.`, "success");
    } catch (e) {
      showToast("Could not regenerate reply.", "error");
    }
  };

  const handleReplyAdded = (newReply) => {
    if (!activeEntry) return;
    const updatedReplies = [...activeEntry.replies, newReply];
    const updatedEntry = { ...activeEntry, replies: updatedReplies };
    setActiveEntry(updatedEntry);
    setCurrentEntry(updatedEntry);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Family Care Link Alert Modal (if triggered) */}
      {parentAlertModal && (
        <ParentAlertModal
          payload={parentAlertModal}
          onClose={() => setParentAlertModal(null)}
        />
      )}

      {/* Editor Component */}
      <DiaryEditor
        text={draftText}
        onChangeText={setDraftText}
        persona={selectedPersona}
        onChangePersona={setSelectedPersona}
        mode={selectedMode}
        onChangeMode={setSelectedMode}
        selectedMood={selectedMood}
        onChangeMood={setSelectedMood}
        attachedPhoto={attachedPhotoFile}
        photoPreview={photoPreviewUrl}
        onAttachPhoto={setAttachedPhoto}
        onRemovePhoto={clearAttachedPhoto}
        onSubmit={handleSubmitEntry}
        isSubmitting={isGeneratingReply}
      />

      {/* Aaina's Warm Reply Card */}
      {activeEntry && (
        <ReplyBubble
          entry={activeEntry}
          replies={activeEntry.replies || []}
          moodLabel={activeEntry.mood_label}
          onRegenerate={handleRegenerateVoice}
          onReplyAdded={handleReplyAdded}
        />
      )}
    </div>
  );
}
