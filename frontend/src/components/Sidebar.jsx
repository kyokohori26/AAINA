import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Home, BookOpen, Clock, BarChart2, Users, User, PenTool, LifeBuoy } from "lucide-react";
import LogoMark from "./LogoMark";
import { useUserStore } from "../store/userStore";

export default function Sidebar() {
  const { user, profile } = useUserStore();
  const displayName = profile?.display_name || user?.name?.split(" ")[0] || "Friend";

  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/diary", label: "Write Entry", icon: BookOpen },
    { path: "/history", label: "Past Entries", icon: Clock },
    { path: "/mood", label: "Mood Timeline", icon: BarChart2 },
    { path: "/circle", label: "The Circle", icon: Users },
    { path: "/me", label: "Me & Settings", icon: User },
  ];

  return (
    <aside aria-label="Desktop Sidebar" className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-cream-300 z-30 shadow-soft">
      {/* Brand Header */}
      <div className="p-6 border-b border-cream-200">
        <Link to="/home" className="inline-block hover:opacity-90 transition-opacity">
          <LogoMark size="md" />
        </Link>
        <p className="text-xs text-ink-muted mt-1.5 font-medium">Say it. Aaina listens.</p>
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <Link
          to="/diary"
          className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-button bg-mirror-blue hover:bg-mirror-hover text-white font-bold text-sm shadow-mirror transition-all hover:shadow-mirror-lg active:scale-98 tap-target"
        >
          <PenTool className="w-4 h-4" />
          <span>Write Today's Entry</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-button text-sm font-semibold transition-all tap-target ${
                  isActive
                    ? "bg-mirror-light text-mirror-blue font-bold shadow-soft"
                    : "text-ink-muted hover:text-ink hover:bg-cream-50"
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Crisis & Support link */}
      <div className="p-3 mx-3 my-2 bg-lavender-light/60 rounded-button border border-lavender/30">
        <Link
          to="/safety"
          className="flex items-center gap-2.5 text-xs font-bold text-lavender-dark hover:text-indigo-900 transition-colors"
        >
          <LifeBuoy className="w-4 h-4 text-lavender-dark flex-shrink-0" />
          <span>Need support now?</span>
        </Link>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-cream-200 flex items-center justify-between">
        <Link to="/me" className="flex items-center gap-3 min-w-0 group">
          <div className="w-9 h-9 rounded-full bg-cream-200 border border-cream-300 flex items-center justify-center text-sm font-bold text-mirror-blue overflow-hidden flex-shrink-0">
            {profile?.photo_path ? (
              <img src={profile.photo_path} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              displayName[0]
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink truncate group-hover:text-mirror-blue transition-colors">
              {displayName}
            </p>
            <p className="text-[11px] text-ink-muted truncate">
              {profile?.default_persona ? profile.default_persona.replace("_", " ") : "Best Friend"}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
