import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Mail, User, Shield, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import LogoMark from "../components/LogoMark";
import { authAPI } from "../services/api";
import { useUserStore } from "../store/userStore";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth, showToast } = useUserStore();

  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(18);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "signup");
  }, [searchParams]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isLogin && age < 13) {
      setErrorMsg("Aaina is designed for users aged 13 and above. Please ask a parent or guardian for assistance.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await authAPI.login({ email, password });
        setAuth(res.data.user, res.data.access_token);
        showToast(`Welcome back, ${res.data.user.name.split(" ")[0]}!`, "success");
        if (!res.data.user.has_profile) {
          navigate("/questionnaire");
        } else {
          navigate("/home");
        }
      } else {
        const res = await authAPI.signup({ name, email, password, age: parseInt(age, 10) });
        setAuth(res.data.user, res.data.access_token);
        showToast("Welcome to Aaina! Let's personalize your diary.", "success");
        navigate("/questionnaire");
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Authentication failed. Please check your credentials.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Demo@1234");
    setIsLogin(true);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center items-center p-4 md:p-8">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <LogoMark size="md" />
          </Link>
          <p className="text-xs text-ink-muted mt-2 font-medium">Say it. Aaina listens.</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-card shadow-mirror-lg border border-cream-300 p-6 md:p-8">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-full bg-cream-200 mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrorMsg(""); }}
              className={`py-2 rounded-full text-xs font-bold transition-all tap-target ${
                isLogin ? "bg-white text-mirror-blue shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrorMsg(""); }}
              className={`py-2 rounded-full text-xs font-bold transition-all tap-target ${
                !isLogin ? "bg-white text-mirror-blue shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-input bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">What should Aaina call you?</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ink-light absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name or preferred nickname"
                      className="w-full pl-10 pr-4 py-2.5 rounded-input border border-cream-300 text-sm text-ink focus:border-mirror-blue outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Your Age</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10) || "")}
                    className="w-full px-4 py-2.5 rounded-input border border-cream-300 text-sm text-ink focus:border-mirror-blue outline-none"
                  />
                  {age && age < 13 && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      Aaina is for ages 13+. Please ask a parent or guardian to assist you.
                    </p>
                  )}
                  {age && age >= 13 && age <= 15 && (
                    <div className="p-2.5 mt-2 rounded-input bg-lavender-light border border-lavender/30 text-[11px] text-lavender-dark leading-snug">
                      <strong>Family Care Link:</strong> Since you're between 13–15, Aaina will let a parent or guardian know if you ever need extra support. They will never see what you write.
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-light absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-input border border-cream-300 text-sm text-ink focus:border-mirror-blue outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-light absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-input border border-cream-300 text-sm text-ink focus:border-mirror-blue outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!isLogin && age < 13)}
              className="w-full py-3 rounded-button bg-mirror-blue hover:bg-mirror-hover text-white font-bold text-sm shadow-mirror transition-all active:scale-98 disabled:opacity-50 tap-target mt-2"
            >
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create My Diary"}
            </button>
          </form>

          {/* Privacy Promise */}
          <div className="mt-5 text-center pt-4 border-t border-cream-200">
            <p className="text-[11px] text-ink-light flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-mirror-blue" />
              Your diary is encrypted. Only you can read it.
            </p>
          </div>
        </div>

        {/* Quick Demo Login Credentials Box for Judges */}
        <div className="mt-6 p-4 rounded-card bg-white/80 border border-cream-300 text-xs">
          <p className="font-bold text-ink mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-mirror-blue" />
            Quick Demo Accounts for Evaluation:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("demo@aaina.app")}
              className="p-2.5 rounded-input bg-mirror-light hover:bg-blue-100 text-left border border-mirror-blue/30 transition-colors"
            >
              <span className="font-bold text-mirror-blue block">Demo: Anushri (21y)</span>
              <span className="text-[10px] text-ink-muted">14 days entries, Circle, Memory</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("aarav@aaina.app")}
              className="p-2.5 rounded-input bg-peach-light hover:bg-orange-100 text-left border border-peach/30 transition-colors"
            >
              <span className="font-bold text-peach block">Demo: Aarav (14y)</span>
              <span className="text-[10px] text-ink-muted">Family Care Link & Guardian Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
