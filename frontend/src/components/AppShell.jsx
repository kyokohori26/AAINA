import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import Toast from "./Toast";
import LogoMark from "./LogoMark";
import { useUserStore } from "../store/userStore";
import { profileAPI } from "../services/api";

export default function AppShell({ children }) {
  const location = useLocation();
  const { user, profile, setProfile, fontSizeScale } = useUserStore();

  // Load profile on mount if logged in
  useEffect(() => {
    if (user && !profile) {
      profileAPI.getProfile()
        .then((res) => setProfile(res.data))
        .catch(() => {});
    }
  }, [user]);

  // Full page screens that don't need shell navigation
  const isPlainScreen = ["/", "/auth", "/questionnaire", "/personas", "/safety", "/parent-demo"].includes(location.pathname);

  if (isPlainScreen) {
    return (
      <div style={{ fontSize: `${fontSizeScale * 100}%` }} className="min-h-screen bg-cream-100 flex flex-col font-nunito">
        <Toast />
        {children}
      </div>
    );
  }

  return (
    <div style={{ fontSize: `${fontSizeScale * 100}%` }} className="min-h-screen bg-cream-100 font-nunito flex">
      <Toast />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-cream-300 z-30 flex items-center justify-between px-4">
        <Link to="/home">
          <LogoMark size="sm" />
        </Link>
        <Link
          to="/safety"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lavender-light text-lavender-dark text-xs font-bold tap-target"
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Help</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 pt-14 md:pt-0 pb-20 md:pb-8 flex flex-col min-w-0">
        <div className="w-full max-w-[960px] mx-auto px-4 md:px-8 py-6 flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="w-full max-w-[960px] mx-auto px-4 md:px-8 py-3.5 border-t border-cream-200 mt-auto text-center flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
          <div className="flex items-center gap-2 font-medium text-ink-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Aaina Companion • Say it. Aaina listens.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-ink-light">
            <span>AES-256 Encrypted</span>
            <span>•</span>
            <Link to="/safety" className="hover:text-mirror-blue font-bold">Helpline: 14416</Link>
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
