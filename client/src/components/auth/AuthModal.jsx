import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Github,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp, signInWithOAuth, demoLogin, isConfigured } = useAuth();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Enable closing with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
        onClose();
      } else {
        const res = await signUp(email, password, { full_name: name || email.split("@")[0] });
        if (res?.session) {
          setSuccessMsg("Account created and signed in successfully!");
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setSuccessMsg("Account created! If your email requires confirmation, check your inbox to confirm, or use Instant Demo Sign In.");
          setTimeout(() => {
            onClose();
          }, 3500);
        }
      }
    } catch (err) {
      const msg = err.message || "Authentication failed. Please check credentials.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setErrorMsg("");
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setErrorMsg(err.message || "OAuth failed.");
    }
  };

  const handleDemoSignIn = (customEmail, customName) => {
    const chosenEmail = customEmail || email || "shivanshrai282@gmail.com";
    const chosenName = customName || name || (chosenEmail ? chosenEmail.split("@")[0] : "Shivansh Rai");
    demoLogin(chosenName, chosenEmail);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl shadow-indigo-500/10 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Supabase Cloud Authentication</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === "signin" ? "Welcome Back to AlgoCraft" : "Create Developer Account"}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === "signin"
              ? "Sign in to sync your solved solutions, sheets, and streak"
              : "Register your new email to start saving custom problem sheets"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "signin"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In (Existing)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "signup"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign Up (New Email)
          </button>
        </div>

        {/* Supabase status indicator */}
        {!isConfigured && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Supabase Keys Pending in .env</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Add <code className="text-white font-mono bg-amber-950/60 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> to connect live database, or use Instant Sign In below.
            </p>
          </div>
        )}

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-xs text-rose-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            {mode === "signin" && (
              <div className="pl-6 pt-1.5 border-t border-rose-500/20 text-[11px] text-rose-200 flex flex-col gap-1.5">
                <span>Signing in with a new email? Create an account first:</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg("");
                  }}
                  className="self-start text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  👉 Click here to Switch to "Sign Up" with {email || "this email"}
                </button>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* OAuth Button */}
        <button
          type="button"
          onClick={() => handleOAuth("github")}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
        >
          <Github className="w-4 h-4 shrink-0" />
          <span>Continue with GitHub</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800/80 w-full" />
          <span className="bg-slate-950 px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 absolute">
            Or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans transition-colors"
                  required={mode === "signup"}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account & Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Mode Switch Helper */}
        <div className="text-center pt-1">
          {mode === "signin" ? (
            <p className="text-xs text-slate-400">
              Need to register a new email?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer ml-1"
              >
                Create Account (Sign Up)
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* Instant Access Options */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          {email && (
            <button
              type="button"
              onClick={() => handleDemoSignIn(email, name)}
              className="w-full py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
              <span>Instant Sign In as "{email.split("@")[0]}" (Skip Cloud Auth)</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDemoSignIn("shivanshrai282@gmail.com", "Shivansh Rai")}
            className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            <span>1-Click Demo Sign In (Shivansh Rai)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
