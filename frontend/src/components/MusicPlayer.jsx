import React, { useEffect, useRef, useState } from "react";
import { Music, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useDiaryStore } from "../store/diaryStore";

export default function MusicPlayer() {
  const { musicChoice, setMusicChoice, musicVolume, setMusicVolume } = useDiaryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const activeNodesRef = useRef([]);
  const timerRef = useRef(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
        const gain = audioCtxRef.current.createGain();
        gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
        gain.connect(audioCtxRef.current.destination);
        masterGainRef.current = gain;
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopAllSounds = () => {
    if (masterGainRef.current && audioCtxRef.current) {
      // Fade out
      const now = audioCtxRef.current.currentTime;
      masterGainRef.current.gain.cancelScheduledValues(now);
      masterGainRef.current.gain.linearRampToValueAtTime(0, now + 1.2);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeout(() => {
      activeNodesRef.current.forEach((n) => {
        try { n.stop ? n.stop() : n.disconnect(); } catch (e) {}
      });
      activeNodesRef.current = [];
      setIsPlaying(false);
    }, 1300);
  };

  const playSoftPad = (ctx, master) => {
    // Beautiful C Major 9 chord: C3, G3, B3, D4, E4
    const freqs = [130.81, 196.00, 246.94, 293.66, 329.63];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const nodeGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Subtle detune for shimmer
      osc.detune.setValueAtTime((idx - 2) * 5, ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      nodeGain.gain.setValueAtTime(0.12 / freqs.length, ctx.currentTime);

      // Slow LFO for organic breath wobble
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.04, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.03, ctx.currentTime);
      lfo.connect(lfoGain.gain);
      lfo.start();

      osc.connect(filter);
      filter.connect(nodeGain);
      nodeGain.connect(master);
      osc.start();

      activeNodesRef.current.push(osc, lfo, filter, nodeGain);
    });
  };

  const playRain = (ctx, master) => {
    // Generate pink/white noise buffer for natural rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Pink-ish filter
      lastOut = output[i];
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(750, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(master);
    whiteNoise.start();

    activeNodesRef.current.push(whiteNoise, filter, gainNode);
  };

  const playPianoChimes = (ctx, master) => {
    // Pentatonic scale chime notes: C4, D4, E4, G4, A4, C5
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    
    const triggerChime = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") return;
      const noteFreq = scale[Math.floor(Math.random() * scale.length)];
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1100, ctx.currentTime);

      const now = ctx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.08, now + 0.08); // soft attack
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5); // long decay

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(master);
      osc.start(now);
      osc.stop(now + 3.8);
    };

    // Trigger initial chime then set gentle random interval
    triggerChime();
    timerRef.current = setInterval(() => {
      triggerChime();
    }, 2800);
  };

  const startSound = (choice) => {
    if (choice === "off") {
      stopAllSounds();
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    // Clear existing nodes first
    activeNodesRef.current.forEach((n) => {
      try { n.stop ? n.stop() : n.disconnect(); } catch (e) {}
    });
    activeNodesRef.current = [];
    if (timerRef.current) clearInterval(timerRef.current);

    const master = masterGainRef.current;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    // 2-second gentle fade in
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(musicVolume, now + 2.0);

    if (choice === "soft_pad") {
      playSoftPad(ctx, master);
    } else if (choice === "rain") {
      playRain(ctx, master);
    } else if (choice === "piano") {
      playPianoChimes(ctx, master);
    }

    setIsPlaying(true);
  };

  useEffect(() => {
    if (musicChoice !== "off") {
      startSound(musicChoice);
    } else {
      stopAllSounds();
    }
    return () => {
      stopAllSounds();
    };
  }, [musicChoice]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current && isPlaying) {
      masterGainRef.current.gain.setValueAtTime(musicVolume, audioCtxRef.current.currentTime);
    }
  }, [musicVolume]);

  const soundOptions = [
    { id: "off", label: "Off" },
    { id: "soft_pad", label: "Soft pad" },
    { id: "rain", label: "Rain" },
    { id: "piano", label: "Piano-like" },
  ];

  return (
    <div className="relative inline-block">
      {/* Sound selector pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Calm writing music selector"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all tap-target ${
          musicChoice !== "off"
            ? "border-lavender bg-lavender-light text-lavender-dark shadow-sm"
            : "border-cream-300 bg-white text-ink-muted hover:text-ink"
        }`}
      >
        <Music className={`w-3.5 h-3.5 ${musicChoice !== "off" ? "animate-pulse text-lavender-dark" : ""}`} />
        <span>Calm music: {soundOptions.find(o => o.id === musicChoice)?.label}</span>
      </button>

      {/* Floating sound controller menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-40 bg-white rounded-card shadow-mirror-lg border border-cream-300 p-4 w-60">
          <p className="text-xs font-bold text-ink mb-2 flex items-center justify-between">
            <span>Writing Sounds</span>
            <span className="text-[10px] text-ink-muted">Web Audio</span>
          </p>
          <div className="space-y-1 mb-4">
            {soundOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setMusicChoice(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-input text-xs font-semibold flex items-center justify-between transition-colors ${
                  musicChoice === opt.id
                    ? "bg-mirror-light text-mirror-blue font-bold"
                    : "text-ink-muted hover:bg-cream-100 hover:text-ink"
                }`}
              >
                <span>{opt.label}</span>
                {musicChoice === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-mirror-blue" />}
              </button>
            ))}
          </div>

          {musicChoice !== "off" && (
            <div className="border-t border-cream-200 pt-3">
              <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1.5">
                <span className="flex items-center gap-1 font-semibold">
                  <Volume2 className="w-3.5 h-3.5" /> Volume
                </span>
                <span>{Math.round(musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-full accent-mirror-blue cursor-pointer h-1.5 bg-cream-200 rounded-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
