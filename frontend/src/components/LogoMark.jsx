import React from "react";

export default function LogoMark({ size = "md", showWordmark = true, className = "" }) {
  const sizeClasses = {
    sm: "w-7 h-8",
    md: "w-9 h-11",
    lg: "w-14 h-16"
  };

  const wordmarkSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl"
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Mirror Icon */}
      <div className={`relative ${sizeClasses[size] || sizeClasses.md} flex-shrink-0 group`}>
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105">
          <defs>
            <linearGradient id="mirrorRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5B8DEF" />
              <stop offset="100%" stopColor="#B8A9F0" />
            </linearGradient>
            <linearGradient id="mirrorGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EEF4FF" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
          </defs>
          {/* Outer Rim */}
          <ellipse cx="50" cy="55" rx="44" ry="50" fill="url(#mirrorRim)" />
          {/* Glass Face */}
          <ellipse cx="50" cy="55" rx="39" ry="45" fill="url(#mirrorGlass)" />
          {/* Soft Highlight Glare */}
          <ellipse cx="38" cy="40" rx="14" ry="24" transform="rotate(-18 38 40)" fill="#FFFFFF" opacity="0.65" />
          {/* Base handle hint */}
          <path d="M 45 104 L 55 104 L 52 118 L 48 118 Z" fill="#5B8DEF" rx="2" />
        </svg>
      </div>

      {/* Wordmark in Caveat */}
      {showWordmark && (
        <span className={`font-handwriting font-bold tracking-wide text-mirror-blue ${wordmarkSizes[size] || wordmarkSizes.md}`}>
          Aaina
        </span>
      )}
    </div>
  );
}
