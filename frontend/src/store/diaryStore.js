import { create } from "zustand";

export const useDiaryStore = create((set, get) => ({
  draftText: "",
  selectedPersona: "best_friend",
  selectedMode: "listen",
  selectedMood: null,
  currentEntry: null,
  isGeneratingReply: false,
  parentAlertModal: null, // payload if triggered
  safetyCrisisModal: null, // payload if high risk
  pendingNudge: null,
  
  // Calm music preferences
  musicChoice: localStorage.getItem("aaina_music_choice") || "off",
  musicVolume: parseFloat(localStorage.getItem("aaina_music_volume") || "0.20"),
  isMusicPlaying: false,

  // Photo Diary state
  attachedPhotoFile: null,
  photoPreviewUrl: null,

  setDraftText: (draftText) => set({ draftText }),
  setSelectedPersona: (selectedPersona) => set({ selectedPersona }),
  setSelectedMode: (selectedMode) => set({ selectedMode }),
  setSelectedMood: (selectedMood) => set({ selectedMood }),
  setCurrentEntry: (currentEntry) => set({ currentEntry }),
  setIsGeneratingReply: (isGeneratingReply) => set({ isGeneratingReply }),
  setParentAlertModal: (parentAlertModal) => set({ parentAlertModal }),
  setSafetyCrisisModal: (safetyCrisisModal) => set({ safetyCrisisModal }),
  setPendingNudge: (pendingNudge) => set({ pendingNudge }),
  setAttachedPhoto: (file, previewUrl) => set({ attachedPhotoFile: file, photoPreviewUrl: previewUrl }),
  clearAttachedPhoto: () => set({ attachedPhotoFile: null, photoPreviewUrl: null }),

  setMusicChoice: (musicChoice) => {
    localStorage.setItem("aaina_music_choice", musicChoice);
    set({ musicChoice });
  },

  setMusicVolume: (musicVolume) => {
    localStorage.setItem("aaina_music_volume", musicVolume.toString());
    set({ musicVolume });
  },

  setIsMusicPlaying: (isMusicPlaying) => set({ isMusicPlaying }),

  resetDraft: () => set({ draftText: "", selectedMood: null, attachedPhotoFile: null, photoPreviewUrl: null })
}));
