import React from "react";
  import { NavLink } from "react-router-dom";
  import { Home, BookOpen, BarChart2, Users, User } from "lucide-react";

  export default function BottomNav() {
    const navItems = [
      { path: "/home", label: "Home", icon: Home },
      { path: "/diary", label: "Diary", icon: BookOpen },
      { path: "/mood", label: "Mood", icon: BarChart2 },
      { path: "/circle", label: "Circle", icon: Users },
      { path: "/me", label: "Me", icon: User },
    ];

    return (
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-300 shadow-mirror safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full py-1 tap-target transition-all ${
                    isActive
                      ? "text-mirror-blue font-bold scale-105"
                      : "text-ink-muted hover:text-ink font-medium"
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[11px] leading-none">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    );
  }
