import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, MessageSquare, HeartHandshake, Shield, ArrowLeft, ExternalLink } from "lucide-react";
import LogoMark from "../components/LogoMark";

export default function SafetyScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 via-rose-50/30 to-cream-100 flex flex-col justify-between p-6 md:p-12">
      {/* Top Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between">
        <LogoMark size="sm" />
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return</span>
        </button>
      </header>

      {/* Main Crisis Support Card */}
      <main className="max-w-2xl w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-card shadow-mirror-lg border-2 border-rose-200 p-6 md:p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="w-8 h-8" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-ink mb-3 leading-tight">
            You don't have to carry this alone.
          </h1>

          <p className="text-sm md:text-base text-ink-muted leading-relaxed max-w-lg mx-auto mb-8">
            I am Aaina, an AI diary companion. Because I am an AI and not a human doctor or counselor, please know that when things hurt this deeply, you deserve compassionate human help.
          </p>

          {/* Helpline Cards */}
          <div className="space-y-3 mb-8 text-left">
            {/* Tele-MANAS */}
            <div className="p-4 rounded-card bg-cream-50 border border-cream-300 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">
                  Government of India • Free & 24/7
                </span>
                <h3 className="text-base font-bold text-ink">Tele-MANAS Toll-Free Helpline</h3>
                <p className="text-xs text-ink-muted">Trained psychological counselors in 20+ regional languages</p>
              </div>
              <a
                href="tel:14416"
                className="flex items-center gap-2 px-5 py-2.5 rounded-button bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors flex-shrink-0 tap-target"
              >
                <Phone className="w-4 h-4" />
                <span>Call 14416</span>
              </a>
            </div>

            {/* Vandrevala Foundation */}
            <div className="p-4 rounded-card bg-cream-50 border border-cream-300 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-mirror-blue uppercase tracking-wider block mb-0.5">
                  Confidential Emotional Support • 24/7
                </span>
                <h3 className="text-base font-bold text-ink">Vandrevala Foundation</h3>
                <p className="text-xs text-ink-muted">Free, confidential mental health counselling</p>
              </div>
              <a
                href="tel:+919999666555"
                className="flex items-center gap-2 px-5 py-2.5 rounded-button bg-mirror-blue hover:bg-mirror-hover text-white font-bold text-sm shadow-sm transition-colors flex-shrink-0 tap-target"
              >
                <Phone className="w-4 h-4" />
                <span>Call Helpline</span>
              </a>
            </div>
          </div>

          {/* Reach out to someone you trust */}
          <div className="pt-6 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="sms:?&body=Hey, I'm having a really difficult time right now and I'd really appreciate someone to talk to."
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-button bg-white border border-cream-300 text-ink hover:bg-cream-100 font-bold text-xs shadow-soft transition-colors w-full sm:w-auto tap-target"
            >
              <MessageSquare className="w-4 h-4 text-mirror-blue" />
              <span>Message someone I trust</span>
            </a>

            <button
              onClick={() => navigate("/diary")}
              className="flex items-center justify-center px-6 py-3 rounded-button bg-cream-200 text-ink font-bold text-xs hover:bg-cream-300 transition-colors w-full sm:w-auto tap-target"
            >
              Return to Diary
            </button>
          </div>
        </div>
      </main>

      {/* Global helpline information */}
      <footer className="max-w-2xl w-full mx-auto text-center text-xs text-ink-light pt-6 border-t border-cream-200">
        <p>Outside India? In the US/Canada, call or text 988. In the UK, call 111. International crisis resources are available 24/7.</p>
      </footer>
    </div>
  );
}
