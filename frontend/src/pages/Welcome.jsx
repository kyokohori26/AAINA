import React from "react";
import { Link } from "react-router-dom";
import { PenLine, Heart, Sparkles, Shield, ArrowRight } from "lucide-react";
import LogoMark from "../components/LogoMark";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 via-cream-50 to-mirror-light flex flex-col justify-between p-6 md:p-12">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <LogoMark size="md" />
        <Link
          to="/auth"
          className="text-xs md:text-sm font-bold text-mirror-blue hover:text-mirror-hover transition-colors tap-target flex items-center"
        >
          Sign In
        </Link>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-3xl w-full mx-auto my-auto text-center py-10">
        {/* Mirror Icon Glow Animation */}
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-white/80 shadow-mirror border border-cream-300">
            <LogoMark size="lg" showWordmark={false} />
          </div>
        </div>

        <h1 className="font-handwriting text-5xl md:text-7xl font-bold text-ink mb-4 leading-tight">
          Say it. Aaina listens.
        </h1>

        <p className="text-base md:text-xl text-ink-muted max-w-xl mx-auto leading-relaxed mb-8">
          An AI diary that listens, remembers, and replies with warmth—like someone who truly knows you.
        </p>

        {/* 3-Point Explainer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
          <div className="p-5 rounded-card bg-white shadow-soft border border-cream-300">
            <div className="w-10 h-10 rounded-full bg-mirror-light text-mirror-blue flex items-center justify-center mb-3">
              <PenLine className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-ink mb-1">Write Freely</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Pour out whatever is on your mind. Free-write or speak your thoughts into private pages.
            </p>
          </div>

          <div className="p-5 rounded-card bg-white shadow-soft border border-cream-300">
            <div className="w-10 h-10 rounded-full bg-lavender-light text-lavender-dark flex items-center justify-center mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-ink mb-1">Get a Caring Reply</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Choose your voice—from a Best Friend to a Caring Mom. Emotional validation always comes before advice.
            </p>
          </div>

          <div className="p-5 rounded-card bg-white shadow-soft border border-cream-300">
            <div className="w-10 h-10 rounded-full bg-peach-light text-peach flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-ink mb-1">Notice Your Patterns</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Aaina gently notices what makes you smile or stressed over time, reflecting patterns back with care.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to="/auth?mode=signup"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-button bg-mirror-blue hover:bg-mirror-hover text-white font-bold text-sm shadow-mirror hover:shadow-mirror-lg transition-all active:scale-95 tap-target"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/auth?mode=login"
            className="flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-button bg-white border border-cream-300 text-ink hover:bg-cream-100 font-bold text-sm shadow-soft transition-colors tap-target"
          >
            I already have an account
          </Link>
        </div>
      </main>

      {/* Safety & Legal Disclaimer Footnote */}
      <footer className="max-w-2xl w-full mx-auto text-center pt-8 border-t border-cream-200">
        <p className="text-xs text-ink-light flex items-center justify-center gap-1.5 leading-relaxed">
          <Shield className="w-3.5 h-3.5 text-lavender flex-shrink-0" />
          Aaina is a caring AI companion for emotional reflection, not a therapist or medical service.
        </p>
      </footer>
    </div>
  );
}
