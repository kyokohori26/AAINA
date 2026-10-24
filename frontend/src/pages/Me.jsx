import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Download,
  Trash2,
  Bell,
  Heart,
  Volume2,
  LifeBuoy,
  LogOut,
  Sparkles,
  Camera
} from "lucide-react";
import MemoryList from "../components/MemoryList";
import ConfirmDialog from "../components/ConfirmDialog";
import { PERSONAS } from "../utils/personas";
import { profileAPI, memoryAPI, accountAPI, guardianAPI } from "../services/api";
import { useUserStore } from "../store/userStore";

export default function Me() {
  const navigate = useNavigate();
  const { user, profile, setProfile, fontSizeScale, setFontSizeScale, logout, showToast } = useUserStore();

  const [memories, setMemories] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  // Settings local edit states
  const [defaultPersona, setDefaultPersona] = useState(profile?.default_persona || "best_friend");
  const [supportStyle, setSupportStyle] = useState(profile?.support_style || "comfort");
  const [replyLength, setReplyLength] = useState(profile?.reply_length || "medium");
  const [language, setLanguage] = useState(profile?.language || "english");
  const [rememberEnabled, setRememberEnabled] = useState(profile?.remember_enabled ?? true);
  const [nudgesEnabled, setNudgesEnabled] = useState(profile?.nudges_enabled ?? true);
  const [quietStart, setQuietStart] = useState(profile?.nudge_quiet_start || "22:00");
  const [quietEnd, setQuietEnd] = useState(profile?.nudge_quiet_end || "08:00");

  const displayName = profile?.display_name || user?.name || "Friend";
  const isTeen = user && user.age >= 13 && user.age <= 15;

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    setIsLoading(true);
    try {
      const [profRes, memRes] = await Promise.all([
        profileAPI.getProfile(),
        memoryAPI.getMemories()
      ]);
      setProfile(profRes.data);
      setDefaultPersona(profRes.data.default_persona || "best_friend");
      setSupportStyle(profRes.data.support_style || "comfort");
      setReplyLength(profRes.data.reply_length || "medium");
      setLanguage(profRes.data.language || "english");
      setRememberEnabled(profRes.data.remember_enabled);
      setNudgesEnabled(profRes.data.nudges_enabled);
      setQuietStart(profRes.data.nudge_quiet_start || "22:00");
      setQuietEnd(profRes.data.nudge_quiet_end || "08:00");

      setMemories(memRes.data);

      if (isTeen) {
        const guardRes = await guardianAPI.getGuardians();
        setGuardians(guardRes.data);
      }
    } catch (e) {
      showToast("Could not load settings.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async (field, value) => {
    try {
      const res = await profileAPI.updateProfile({ [field]: value });
      setProfile(res.data);
      showToast("Preferences saved.", "success");
    } catch (e) {
      showToast("Could not update preferences.", "error");
    }
  };

  const handleDeleteMemory = async (id) => {
    try {
      await memoryAPI.deleteMemory(id);
      setMemories(memories.filter((m) => m.id !== id));
      showToast("Memory forgotten.", "success");
    } catch (e) {
      showToast("Could not delete memory.", "error");
    }
  };

  const handleExportData = async () => {
    try {
      const res = await accountAPI.exportData();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `aaina_diary_export_${displayName.toLowerCase()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Diary export downloaded successfully.", "success");
    } catch (e) {
      showToast("Could not export data.", "error");
    }
  };

  const handleDeleteAllData = async () => {
    try {
      await accountAPI.deleteData();
      logout();
      showToast("All your data has been completely erased.", "success");
      navigate("/");
    } catch (e) {
      showToast("Could not delete data.", "error");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await profileAPI.uploadPhoto(formData);
      setProfile({ ...profile, photo_path: res.data.photo_url });
      showToast("Mirror photo updated!", "success");
    } catch (err) {
      showToast("Could not upload photo.", "error");
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await profileAPI.deletePhoto();
      setProfile({ ...profile, photo_path: null });
      showToast("Photo removed from mirror.", "success");
    } catch (e) {
      showToast("Could not remove photo.", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto pb-10">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-ink">Me & Privacy</h1>
        <p className="text-xs md:text-sm text-ink-muted mt-1">
          Complete control over your memories, voice, privacy, and wellbeing settings.
        </p>
      </div>

      {/* Profile Header Card with Photo Upload */}
      <div className="p-6 rounded-card bg-white border border-cream-300 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-cream-200 border-2 border-mirror-blue overflow-hidden flex items-center justify-center text-xl font-bold text-mirror-blue">
              {profile?.photo_path ? (
                <img src={profile.photo_path} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName[0]
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white border border-cream-300 shadow-soft text-ink-muted hover:text-mirror-blue cursor-pointer">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ink">{displayName}</h2>
            <p className="text-xs text-ink-muted">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-cream-100 border border-cream-300 text-[10px] font-bold text-ink-muted">
              Age {user?.age || 20} {isTeen && "• Teen Account (Family Care Link)"}
            </span>
          </div>
        </div>

        {profile?.photo_path && (
          <button
            onClick={handleRemovePhoto}
            className="text-xs font-semibold text-rose-500 hover:underline"
          >
            Remove mirror photo
          </button>
        )}
      </div>

      {/* Font Size Accessibility Controls (A+ / A-) */}
      <div className="p-5 rounded-card bg-white border border-cream-300 shadow-soft flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Reading Comfort</h3>
          <p className="text-xs text-ink-muted">Adjust text size for comfortable journaling</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSizeScale(fontSizeScale - 0.05)}
            className="px-3 py-1.5 rounded-button bg-cream-200 text-ink text-xs font-bold hover:bg-cream-300 tap-target"
          >
            A-
          </button>
          <span className="text-xs font-bold text-mirror-blue w-12 text-center">
            {Math.round(fontSizeScale * 100)}%
          </span>
          <button
            onClick={() => setFontSizeScale(fontSizeScale + 0.05)}
            className="px-3 py-1.5 rounded-button bg-cream-200 text-ink text-xs font-bold hover:bg-cream-300 tap-target"
          >
            A+
          </button>
        </div>
      </div>

      {/* Voice & Persona Settings */}
      <div className="p-6 rounded-card bg-white border border-cream-300 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-mirror-blue" />
          <span>Aaina's Voice & Persona Archetype</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PERSONAS.map((p) => {
            const isSelected = defaultPersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setDefaultPersona(p.id);
                  handleUpdateSettings("default_persona", p.id);
                }}
                className={`p-3 rounded-input border text-left transition-all tap-target ${
                  isSelected
                    ? "border-mirror-blue bg-mirror-light text-mirror-blue font-bold shadow-soft"
                    : "border-cream-300 bg-white text-ink-muted hover:bg-cream-50"
                }`}
              >
                <span className="block text-xs font-bold">{p.name}</span>
                <span className="text-[10px] text-ink-muted">{p.tone.split(",")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Reply Length & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-ink mb-1">Reply Length</label>
            <select
              value={replyLength}
              onChange={(e) => {
                setReplyLength(e.target.value);
                handleUpdateSettings("reply_length", e.target.value);
              }}
              className="w-full px-3 py-2 rounded-input border border-cream-300 text-xs font-semibold text-ink bg-white"
            >
              <option value="short">Short & punchy (under 80 words)</option>
              <option value="medium">Warm & expressive (around 120-150 words)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1">Reply Language</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                handleUpdateSettings("language", e.target.value);
              }}
              className="w-full px-3 py-2 rounded-input border border-cream-300 text-xs font-semibold text-ink bg-white"
            >
              <option value="english">Standard English</option>
              <option value="hinglish">Hinglish (Everyday Hindi-English)</option>
              <option value="hindi">Hindi (हिंदी - Pure Devanagari)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Memory Controls */}
      <div className="p-6 rounded-card bg-white border border-cream-300 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-ink">What Aaina Remembers</h3>
            <p className="text-xs text-ink-muted">Facts Aaina gently stores to personalize replies</p>
          </div>

          {/* No Memory Mode Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-ink">
            <span>Remember context</span>
            <input
              type="checkbox"
              checked={rememberEnabled}
              onChange={(e) => {
                setRememberEnabled(e.target.checked);
                handleUpdateSettings("remember_enabled", e.target.checked);
              }}
              className="rounded text-mirror-blue"
            />
          </label>
        </div>

        <MemoryList memories={memories} onDeleteMemory={handleDeleteMemory} />
      </div>

      {/* Gentle Inactivity Check-in Nudge Settings */}
      <div className="p-6 rounded-card bg-white border border-cream-300 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Bell className="w-4 h-4 text-mirror-blue" />
              <span>Gentle Check-In Nudges</span>
            </h3>
            <p className="text-xs text-ink-muted">Warm notes when you go quiet for a few days</p>
          </div>
          <input
            type="checkbox"
            checked={nudgesEnabled}
            onChange={(e) => {
              setNudgesEnabled(e.target.checked);
              handleUpdateSettings("nudges_enabled", e.target.checked);
            }}
            className="rounded text-mirror-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-ink mb-1">Quiet Hours Start</label>
            <input
              type="time"
              value={quietStart}
              onChange={(e) => {
                setQuietStart(e.target.value);
                handleUpdateSettings("nudge_quiet_start", e.target.value);
              }}
              className="w-full px-3 py-1.5 rounded-input border border-cream-300 text-xs font-semibold text-ink"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink mb-1">Quiet Hours End</label>
            <input
              type="time"
              value={quietEnd}
              onChange={(e) => {
                setQuietEnd(e.target.value);
                handleUpdateSettings("nudge_quiet_end", e.target.value);
              }}
              className="w-full px-3 py-1.5 rounded-input border border-cream-300 text-xs font-semibold text-ink"
            />
          </div>
        </div>
      </div>

      {/* Family Care Link (Under 16) */}
      {isTeen && (
        <div className="p-6 rounded-card bg-lavender-light/60 border border-lavender/40 shadow-soft space-y-3">
          <div className="flex items-center gap-2 text-lavender-dark font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>Family Care Link is Active</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Because you are under 16, a gentle care alert is shared with your guardian if repeated high distress is detected. Your private entries are never shared.
          </p>

          {guardians.length > 0 ? (
            <div className="p-3 bg-white rounded-input border border-cream-300 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-ink">{guardians[0].name}</p>
                <p className="text-ink-muted text-[11px]">{guardians[0].contact}</p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                Linked Guardian
              </span>
            </div>
          ) : (
            <p className="text-xs text-ink-muted italic">No guardian contact registered.</p>
          )}
        </div>
      )}

      {/* Helplines Card */}
      <div className="p-6 rounded-card bg-cream-50 border border-cream-300 shadow-soft space-y-3">
        <div className="flex items-center gap-2 text-ink font-bold text-sm">
          <LifeBuoy className="w-4 h-4 text-rose-500" />
          <span>Confidential Crisis & Support Helplines</span>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          If you ever feel overwhelmed or unsafe, please reach out to professional human support:
        </p>
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-input bg-white border border-cream-200">
            <p className="font-bold text-ink">Tele-MANAS (Government of India)</p>
            <p className="text-mirror-blue font-bold text-sm">14416 (Toll-Free, 24/7)</p>
          </div>
          <div className="p-3 rounded-input bg-white border border-cream-200">
            <p className="font-bold text-ink">Vandrevala Foundation</p>
            <p className="text-mirror-blue font-bold text-sm">+91 9999 666 555 (24/7 Support)</p>
          </div>
        </div>
      </div>

      {/* Data Export & Account Actions */}
      <div className="p-6 rounded-card bg-white border border-cream-300 shadow-soft space-y-3">
        <h3 className="text-sm font-bold text-ink">Your Data & Account</h3>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-button border border-cream-300 bg-white hover:bg-cream-100 text-xs font-bold text-ink transition-colors tap-target"
          >
            <Download className="w-4 h-4 text-mirror-blue" />
            <span>Export My Diary Data (JSON)</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-button border border-cream-300 bg-white hover:bg-cream-100 text-xs font-bold text-ink-muted hover:text-ink transition-colors tap-target"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={() => setShowDeleteAllDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-button bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-600 transition-colors ml-auto tap-target"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All My Data</span>
          </button>
        </div>
      </div>

      {/* Delete All Data Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAllDialog}
        title="Permanently delete all your data?"
        message="This action will permanently wipe your diary entries, memories, circle contacts, and account from our servers. This cannot be undone."
        confirmLabel="Yes, erase everything"
        isDanger={true}
        onConfirm={handleDeleteAllData}
        onCancel={() => setShowDeleteAllDialog(false)}
      />
    </div>
  );
}
