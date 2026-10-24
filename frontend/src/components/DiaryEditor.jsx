import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  ChevronDown,
  Camera,
  Image as ImageIcon,
  X,
  Sparkle,
  Eye,
  Shield
} from "lucide-react";
import MoodPicker from "./MoodPicker";
import MusicPlayer from "./MusicPlayer";
import { PERSONAS, getPersonaById } from "../utils/personas";
import { formatDate } from "../utils/format";

export default function DiaryEditor({
  text,
  onChangeText,
  persona,
  onChangePersona,
  mode,
  onChangeMode,
  selectedMood,
  onChangeMood,
  attachedPhoto,
  photoPreview,
  onAttachPhoto,
  onRemovePhoto,
  onSubmit,
  isSubmitting = false
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = "en-US";

      recognizer.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onChangeText(text ? `${text} ${transcript}` : transcript);
        }
      };

      recognizer.onerror = () => {
        setIsRecording(false);
      };

      recognizer.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognizer;
    }
  }, [text]);

  const toggleSpeech = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  // Client-side image resize to max 1024px before uploading
  const processAndResizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name || "diary_photo.jpg", {
                  type: "image/jpeg"
                });
                resolve({
                  file: resizedFile,
                  previewUrl: canvas.toDataURL("image/jpeg", 0.85)
                });
              } else {
                reject(new Error("Canvas export failed"));
              }
            },
            "image/jpeg",
            0.85
          );
        };
        img.onerror = () => reject(new Error("Image decoding failed"));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("FileReader error"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    try {
      const { file: resizedFile, previewUrl } = await processAndResizeImage(file);
      if (onAttachPhoto) {
        onAttachPhoto(resizedFile, previewUrl);
      }
    } catch (err) {
      console.error("Photo resize failed:", err);
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectDemoPhoto = async (url, filename) => {
    setIsProcessingPhoto(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const demoFile = new File([blob], filename, { type: "image/jpeg" });
      const { file: resizedFile, previewUrl } = await processAndResizeImage(demoFile);
      if (onAttachPhoto) {
        onAttachPhoto(resizedFile, previewUrl);
      }
    } catch (err) {
      console.error("Demo photo load failed:", err);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const currentPersona = getPersonaById(persona);
  const canSubmit = !isSubmitting && (text.trim().length > 0 || attachedPhoto !== null);

  return (
    <div className="rounded-card bg-white border border-cream-300 shadow-mirror-lg overflow-hidden">
      {/* Top Header Toolbar */}
      <div className="p-4 md:p-6 border-b border-cream-200 flex flex-wrap items-center justify-between gap-4 bg-cream-50/70">
        <div>
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
            Today's Page
          </span>
          <h2 className="text-lg md:text-xl font-bold text-ink">
            {formatDate(new Date())}
          </h2>
        </div>

        {/* Ambient Web Audio Music Chip */}
        <MusicPlayer />
      </div>

      {/* Mood Selector Row */}
      <div className="px-4 md:px-6 py-3 border-b border-cream-200 bg-white">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-ink-muted">
            How does your day feel right now? (optional)
          </span>
        </div>
        <MoodPicker selectedMood={selectedMood} onSelectMood={onChangeMood} size="sm" />
      </div>

      {/* Attached Photo Preview Banner */}
      {photoPreview && (
        <div className="mx-4 md:mx-6 mt-4 p-3 rounded-card bg-mirror-light/40 border border-mirror-blue/30 flex items-center justify-between gap-4 animate-scale-in">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={photoPreview}
              alt="Attached diary page"
              className="w-16 h-16 rounded-input object-cover border border-white shadow-soft shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-mirror-blue">
                <Camera className="w-3.5 h-3.5" />
                <span>Photo Diary attached (max 1024px)</span>
              </div>
              <p className="text-[11px] text-ink-muted truncate">
                Aaina will read handwriting or gently describe the scene. Never infers faces or identities.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemovePhoto}
            className="p-1.5 rounded-full hover:bg-cream-200 text-ink-muted hover:text-ink transition-colors"
            title="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notebook Ruled Paper Text Area */}
      <div className="relative p-4 md:p-6 notebook-paper min-h-[280px]">
        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={
            attachedPhoto
              ? "You've attached a photo! Add any extra thoughts here, or send as is for Aaina to read..."
              : "Write whatever is on your mind today... How was your day? What made you smile, stress, or pause?"
          }
          className="w-full bg-transparent border-none outline-none resize-none font-nunito text-base md:text-lg text-ink placeholder:text-ink-light leading-[36px] min-h-[220px]"
          rows={7}
        />

        {/* Live speech feedback pill */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Listening to your voice...</span>
          </div>
        )}
      </div>

      {/* Demo Photos Quick Selector & Privacy Notice */}
      <div className="px-4 md:px-6 py-2 bg-cream-50/90 border-t border-cream-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-ink-muted flex items-center gap-1">
            <Sparkle className="w-3 h-3 text-mirror-blue" />
            <span>Try sample demo photos:</span>
          </span>
          <button
            type="button"
            onClick={() => handleSelectDemoPhoto("/demo_photos/handwritten_diary.jpg", "handwritten_diary.jpg")}
            className="px-2.5 py-1 rounded-full bg-white border border-cream-300 text-ink text-[11px] font-semibold hover:border-mirror-blue hover:text-mirror-blue transition-colors shadow-soft"
          >
            ✍️ Handwritten Note
          </button>
          <button
            type="button"
            onClick={() => handleSelectDemoPhoto("/demo_photos/drawing_chai.jpg", "drawing_chai.jpg")}
            className="px-2.5 py-1 rounded-full bg-white border border-cream-300 text-ink text-[11px] font-semibold hover:border-mirror-blue hover:text-mirror-blue transition-colors shadow-soft"
          >
            ☕ Chai Sketch
          </button>
          <button
            type="button"
            onClick={() => handleSelectDemoPhoto("/demo_photos/rainy_day.jpg", "rainy_day.jpg")}
            className="px-2.5 py-1 rounded-full bg-white border border-cream-300 text-ink text-[11px] font-semibold hover:border-mirror-blue hover:text-mirror-blue transition-colors shadow-soft"
          >
            🌧️ Rainy Window
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-ink-muted">
          <Shield className="w-3 h-3 text-sage-green" />
          <span>Photos never stored on server</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="p-4 md:p-6 border-t border-cream-200 bg-cream-50/50 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Persona Switcher & Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Persona Chip Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPersonaPicker(!showPersonaPicker)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-cream-300 bg-white text-xs font-bold text-ink hover:border-mirror-blue shadow-soft tap-target"
            >
              <span>Reply as:</span>
              <span className="text-mirror-blue">{currentPersona.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            </button>

            {showPersonaPicker && (
              <div className="absolute left-0 bottom-full mb-2 bg-white rounded-card shadow-mirror-lg border border-cream-300 p-2 w-52 z-30">
                <p className="text-[10px] font-bold text-ink-muted px-2 py-1 uppercase">Choose Archetype</p>
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChangePersona(p.id);
                      setShowPersonaPicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-input text-xs font-semibold hover:bg-mirror-light hover:text-mirror-blue flex items-center justify-between ${
                      p.id === persona ? "bg-mirror-light text-mirror-blue font-bold" : "text-ink"
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-ink-muted">{p.tone.split(",")[0]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Just Listen vs Listen & Advice Mode Toggle */}
          <div className="inline-flex rounded-full p-1 bg-cream-200 border border-cream-300">
            <button
              type="button"
              onClick={() => onChangeMode("listen")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all tap-target ${
                mode === "listen"
                  ? "bg-white text-mirror-blue shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Just listen
            </button>
            <button
              type="button"
              onClick={() => onChangeMode("advice")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all tap-target ${
                mode === "advice"
                  ? "bg-white text-mirror-blue shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Listen & give advice
            </button>
          </div>
        </div>

        {/* Right: Add Photo, Mic & Submit Button */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Add a Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingPhoto || isSubmitting}
            title="Attach handwritten note, drawing, or photo"
            aria-label="Add a photo"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full border text-xs font-bold transition-all tap-target shadow-soft ${
              photoPreview
                ? "bg-mirror-light border-mirror-blue text-mirror-blue"
                : "bg-white border-cream-300 text-ink-muted hover:text-mirror-blue hover:border-mirror-blue"
            }`}
          >
            <Camera className="w-4 h-4 text-mirror-blue" />
            <span>{photoPreview ? "Change photo" : "Add a photo"}</span>
          </button>

          {/* Speech-to-text mic button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleSpeech}
              title={isRecording ? "Stop recording" : "Speak your entry"}
              aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
              className={`p-3 rounded-full border transition-all tap-target ${
                isRecording
                  ? "bg-rose-500 border-rose-600 text-white shadow-mirror scale-105"
                  : "bg-white border-cream-300 text-ink-muted hover:text-mirror-blue hover:border-mirror-blue"
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {/* Send to Aaina Button */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-6 py-3 rounded-button bg-mirror-blue hover:bg-mirror-hover text-white font-bold text-sm shadow-mirror transition-all hover:shadow-mirror-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none tap-target"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Aaina is reflecting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send to Aaina</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
