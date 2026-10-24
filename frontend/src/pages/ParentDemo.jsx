import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Bell, Heart, ArrowLeft, MessageSquare, CheckCircle2 } from "lucide-react";
import LogoMark from "../components/LogoMark";
import { alertAPI } from "../services/api";

export default function ParentDemo() {
  const [demoData, setDemoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    alertAPI.getDemoView()
      .then((res) => setDemoData(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between p-4 md:p-10">
      {/* Top Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between mb-4">
        <LogoMark size="sm" />
        <Link
          to="/home"
          className="flex items-center gap-1.5 text-xs font-bold text-mirror-blue hover:underline tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </Link>
      </header>

      {/* Main Presentation Device Frame */}
      <main className="max-w-md w-full mx-auto my-auto">
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold text-peach uppercase tracking-wider">
            Live Demonstration for Judges
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-ink mt-1">
            Simulated Parent Device View
          </h1>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            See exactly how a parent receives a Family Care Link notification when their teenager experiences strain.
          </p>
        </div>

        {/* Smartphone Mockup */}
        <div className="bg-ink p-3 rounded-[40px] shadow-2xl border-4 border-ink">
          {/* Phone Screen */}
          <div className="bg-cream-100 rounded-[32px] overflow-hidden min-h-[520px] flex flex-col justify-between p-5 border border-cream-200">
            {/* Top Phone Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-bold text-ink-muted mb-4 px-1">
              <span>9:41 AM</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Notification Banner on Parent's Phone */}
            <div className="bg-white/95 backdrop-blur-md rounded-card p-4 shadow-mirror border border-cream-300 animate-fade-in">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-mirror-blue text-white flex items-center justify-center text-[10px] font-bold">
                    A
                  </div>
                  <span className="text-xs font-bold text-ink">Aaina Care Alert</span>
                </div>
                <span className="text-[10px] text-ink-light">Just now</span>
              </div>

              <p className="text-xs text-ink leading-relaxed font-medium">
                "{demoData?.message || "Hi Pooja, Aarav's Aaina diary suggests they may need some attention and care today. Please check in with them kindly and listen first. You don't need to ask about what they wrote."}"
              </p>
            </div>

            {/* Privacy Proof Box */}
            <div className="my-auto py-6">
              <div className="p-4 rounded-card bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Privacy Safeguard In Action</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Notice that <strong>zero diary entries, thoughts, or emotions</strong> are quoted to the parent.
                  The alert acts solely as a prompt to offer gentle warmth.
                </p>
              </div>

              {/* Helpful Tips for the Parent */}
              <div className="mt-4 p-4 rounded-card bg-white border border-cream-300 shadow-soft">
                <h4 className="text-xs font-bold text-ink mb-2">Guidance for Parents:</h4>
                <ul className="space-y-1.5 text-[11px] text-ink-muted">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-mirror-blue flex-shrink-0 mt-0.5" />
                    <span>Start with warmth: "Hey, just wanted to see how your day went."</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-mirror-blue flex-shrink-0 mt-0.5" />
                    <span>Listen without interrogating or demanding to see what they wrote.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-mirror-blue flex-shrink-0 mt-0.5" />
                    <span>Offer a comforting snack, hot tea, or quiet reassurance.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Phone Indicator */}
            <div className="w-28 h-1 bg-ink/30 rounded-full mx-auto mt-2" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-xs text-ink-muted mt-6">
        Family Care Link empowers parents to support teens while preserving the sacred trust of a diary.
      </footer>
    </div>
  );
}
