import React, { useState } from "react";
import { User, MessageCircle, Mail, Sparkles, Heart } from "lucide-react";

export default function CircleMap({ people = [], onSelectPerson, userName = "You" }) {
  const [hoveredPerson, setHoveredPerson] = useState(null);

  // Group people by ring
  const closeFriends = people.filter(p => p.ring === "close friend");
  const family = people.filter(p => p.ring === "family");
  const colleagues = people.filter(p => p.ring === "colleague");

  // Center SVG coordinates
  const cx = 200;
  const cy = 200;

  // Radius for concentric rings
  const rFriends = 75;
  const rFamily = 125;
  const rColleagues = 175;

  const getPosition = (index, total, radius) => {
    if (total === 0) return { x: cx, y: cy };
    // Distribute with pleasant offset
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      <div className="w-full max-w-[400px] aspect-square relative">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Concentric Rings */}
          <circle cx={cx} cy={cy} r={rColleagues} fill="#FBF8F3" stroke="#ECE6DC" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx={cx} cy={cy} r={rFamily} fill="#FFFFFF" stroke="#ECE6DC" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx={cx} cy={cy} r={rFriends} fill="url(#centerGlow)" stroke="#B8A9F0" strokeWidth="2" strokeDasharray="2 2" />

          {/* Ring Labels */}
          <text x={cx} y={cy - rColleagues + 14} textAnchor="middle" fill="#9CA3AF" fontSize="10" fontWeight="700">
            COLLEAGUES
          </text>
          <text x={cx} y={cy - rFamily + 14} textAnchor="middle" fill="#9CA3AF" fontSize="10" fontWeight="700">
            FAMILY
          </text>
          <text x={cx} y={cy - rFriends + 14} textAnchor="middle" fill="#5B8DEF" fontSize="10" fontWeight="700">
            CLOSE FRIENDS
          </text>

          {/* Center User Dot */}
          <g className="cursor-pointer">
            <circle cx={cx} cy={cy} r="26" fill="#5B8DEF" filter="drop-shadow(0 4px 10px rgba(91,141,239,0.3))" />
            <text x={cx} y={cy + 4} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800">
              {userName.split(" ")[0]}
            </text>
          </g>

          {/* Close Friends Dots */}
          {closeFriends.map((p, i) => {
            const pos = getPosition(i, closeFriends.length, rFriends);
            const isHovered = hoveredPerson?.id === p.id;
            return (
              <g
                key={p.id}
                onClick={() => onSelectPerson && onSelectPerson(p)}
                onMouseEnter={() => setHoveredPerson(p)}
                onMouseLeave={() => setHoveredPerson(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 20 : 16}
                  fill="#B8A9F0"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  className="transition-all duration-200"
                />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                  {p.name[0]}
                </text>
              </g>
            );
          })}

          {/* Family Dots */}
          {family.map((p, i) => {
            const pos = getPosition(i, family.length, rFamily);
            const isHovered = hoveredPerson?.id === p.id;
            return (
              <g
                key={p.id}
                onClick={() => onSelectPerson && onSelectPerson(p)}
                onMouseEnter={() => setHoveredPerson(p)}
                onMouseLeave={() => setHoveredPerson(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 20 : 16}
                  fill="#FFB38A"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  className="transition-all duration-200"
                />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                  {p.name[0]}
                </text>
              </g>
            );
          })}

          {/* Colleagues Dots */}
          {colleagues.map((p, i) => {
            const pos = getPosition(i, colleagues.length, rColleagues);
            const isHovered = hoveredPerson?.id === p.id;
            return (
              <g
                key={p.id}
                onClick={() => onSelectPerson && onSelectPerson(p)}
                onMouseEnter={() => setHoveredPerson(p)}
                onMouseLeave={() => setHoveredPerson(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 20 : 16}
                  fill="#6BCB9B"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  className="transition-all duration-200"
                />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                  {p.name[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Person Card Overlay */}
        {hoveredPerson && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-card bg-white shadow-mirror border border-cream-300 text-center pointer-events-none animate-fade-in">
            <p className="text-xs font-bold text-ink">{hoveredPerson.name}</p>
            <p className="text-[10px] text-ink-muted capitalize">{hoveredPerson.ring}</p>
            {hoveredPerson.note && (
              <p className="text-[10px] text-mirror-blue italic mt-0.5 max-w-[200px] truncate">
                "{hoveredPerson.note}"
              </p>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-ink-muted text-center mt-2">
        Tap any circle node to view notes or reach out.
      </p>
    </div>
  );
}
