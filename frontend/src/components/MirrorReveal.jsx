import React, { useRef, useEffect, useState } from "react";
import { RefreshCw, Eye, Sparkles } from "lucide-react";

export default function MirrorReveal({ photoUrl, userDisplayName = "You", className = "" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);
  const [clearedPercent, setClearedPercent] = useState(0);
  const isDrawing = useRef(false);

  // Initialize canvas fog layer
  const initFog = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    
    // Support high DPI
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Draw frosted glass fog with gradient shimmer
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, "rgba(235, 240, 255, 0.94)");
    grad.addColorStop(0.5, "rgba(225, 230, 250, 0.96)");
    grad.addColorStop(1, "rgba(245, 235, 250, 0.95)");
    
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add subtle frost noise/texture
    ctx.fillStyle = "rgba(184, 169, 240, 0.15)";
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * rect.width;
      const ry = Math.random() * rect.height;
      ctx.fillRect(rx, ry, 2, 2);
    }

    setIsFullyRevealed(false);
    setClearedPercent(0);
  };

  useEffect(() => {
    initFog();
    const handleResize = () => initFog();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [photoUrl]);

  const eraseFog = (clientX, clientY) => {
    if (isFullyRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Erase with destination-out feathered radial gradient
    ctx.globalCompositeOperation = "destination-out";
    const brushRadius = 55;
    const radGrad = ctx.createRadialGradient(x, y, 10, x, y, brushRadius);
    radGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
    radGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.8)");
    radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
    ctx.fill();

    // Estimate cleared percentage periodically
    checkClearedAmount();
  };

  let checkCounter = 0;
  const checkClearedAmount = () => {
    checkCounter++;
    if (checkCounter % 15 !== 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    try {
      // Sample a scaled down grid
      const sampleData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparentPixels = 0;
      const totalPixels = sampleData.length / 4;

      for (let i = 3; i < sampleData.length; i += 32) {
        if (sampleData[i] < 40) {
          transparentPixels += 8;
        }
      }

      const ratio = transparentPixels / totalPixels;
      setClearedPercent(Math.min(100, Math.round(ratio * 100)));

      if (ratio > 0.55) {
        setIsFullyRevealed(true);
      }
    } catch (e) {
      // Cross origin safety fallback
    }
  };

  const handlePointerMove = (e) => {
    eraseFog(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      eraseFog(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Arch-shaped mirror frame */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onTouchMove={handleTouchMove}
        className="relative w-64 h-80 rounded-t-[120px] rounded-b-[40px] p-2 bg-gradient-to-b from-mirror-blue/30 via-lavender/30 to-peach/30 shadow-mirror-lg overflow-hidden select-none cursor-pointer group"
      >
        <div className="relative w-full h-full rounded-t-[115px] rounded-b-[35px] overflow-hidden bg-cream-50 flex items-center justify-center">
          {/* Underlying photo or friendly mirror illustration */}
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Your reflection"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-mirror-light via-cream-50 to-lavender-light">
              <div className="w-20 h-20 rounded-full bg-white shadow-soft flex items-center justify-center mb-3 text-mirror-blue">
                <Sparkles className="w-10 h-10" />
              </div>
              <p className="font-handwriting text-2xl font-bold text-ink">
                {userDisplayName}
              </p>
              <p className="text-xs text-ink-muted mt-1 leading-snug">
                Upload a photo in Me to see yourself reflected in the mirror.
              </p>
            </div>
          )}

          {/* Frosted Canvas Layer */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full touch-none transition-opacity duration-700 pointer-events-auto ${
              isFullyRevealed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          />

          {/* Hint Overlay when fog is full */}
          {!isFullyRevealed && clearedPercent < 20 && (
            <div className="absolute inset-x-0 bottom-6 flex flex-col items-center pointer-events-none px-4 text-center">
              <span className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-xs font-bold text-ink shadow-sm border border-cream-300 animate-pulse">
                Move to see yourself ✨
              </span>
            </div>
          )}

          {/* Fully Revealed Banner */}
          {isFullyRevealed && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
              <span className="font-handwriting text-2xl font-bold px-4 py-1 rounded-full bg-white/90 backdrop-blur-sm text-mirror-blue shadow-mirror">
                This is you. ❤️
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons under mirror */}
      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={initFog}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-semibold text-ink-muted hover:text-ink hover:bg-cream-200 transition-colors tap-target"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Fog the mirror again</span>
        </button>

        {!isFullyRevealed && (
          <button
            type="button"
            onClick={() => setIsFullyRevealed(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-semibold text-mirror-blue hover:bg-mirror-light transition-colors tap-target"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show photo</span>
          </button>
        )}
      </div>
    </div>
  );
}
