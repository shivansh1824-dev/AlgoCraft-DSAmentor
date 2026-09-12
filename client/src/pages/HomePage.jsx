import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Terminal,
  Compass,
  CheckCircle2,
  Zap,
  Bot,
  Brain,
  Search,
  Flame,
  Check,
  FileSpreadsheet,
  Timer,
  PlayCircle,
  BookOpen
} from "lucide-react";

export default function HomePage() {
  const [quickInput, setQuickInput] = useState("");
  const navigate = useNavigate();

  const handleQuickSolve = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    navigate("/studio", { state: { initialProblem: quickInput } });
  };

  const sampleProblems = [
    { name: "Two Sum", platform: "LeetCode", diff: "Easy", topic: "Arrays" },
    { name: "3Sum", platform: "LeetCode", diff: "Medium", topic: "Two Pointers" },
    { name: "Trapping Rain Water", platform: "LeetCode", diff: "Hard", topic: "Dynamic Programming" },
    { name: "LRU Cache", platform: "LeetCode", diff: "Medium", topic: "Design / Linked List" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Glow Ambient Gradients & Hero Algorithmic Neural Canvas Image */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none -z-10 overflow-hidden">
        <img 
          src="/images/hero_algo_bg.jpg" 
          alt="Algorithmic Data Graph Backdrop" 
          className="w-full h-full object-cover object-top opacity-30 mask-radial-fade filter saturate-125 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090D16]/70 to-[#090D16]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090D16] via-transparent to-[#090D16]" />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-600/20 via-emerald-500/15 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold text-slate-300">
              AlgoCraft v1.0 • 100% Free & Open Access
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              No Billing
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            The AI DSA Mentor that teaches you to{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              think
            </span>
            , not just copy code.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop grinding raw editorials. AlgoCraft breaks down any DSA problem into intuitive mental models, compares Brute-force to Optimal solutions, traces edge cases step-by-step, and tutors you via an embedded AI mentor.
          </p>

          {/* Quick Problem Launcher */}
          <div className="pt-4 max-w-2xl mx-auto">
            <form
              onSubmit={handleQuickSolve}
              className="relative flex items-center p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl glow-indigo focus-within:border-indigo-500 transition-all"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3 mr-2" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Enter problem name (e.g., Two Sum, Coin Change, Word Break)..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none py-2"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-md transition-all flex-shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Deconstruct</span>
              </button>
            </form>

            {/* Quick Chips */}
            <div className="flex items-center justify-center gap-2 flex-wrap mt-3 text-xs text-slate-400">
              <span className="text-slate-500">Try classic problems:</span>
              {sampleProblems.map((prob) => (
                <button
                  key={prob.name}
                  onClick={() => navigate("/studio", { state: { initialProblem: prob.name, topic: prob.topic, difficulty: prob.diff } })}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                >
                  {prob.name} <span className="text-[10px] text-slate-400">({prob.diff})</span>
                </button>
              ))}
            </div>

            {/* Main Action CTAs */}
            <div className="flex items-center justify-center gap-3 pt-6 flex-wrap">
              <Link
                to="/sheets"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-white font-semibold text-xs transition-all shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Track Problem Sheets</span>
              </Link>

              <Link
                to="/interview"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-white font-semibold text-xs transition-all shadow-md"
              >
                <Timer className="w-4 h-4 text-rose-400" />
                <span>FAANG Mock Interview</span>
              </Link>

              <Link
                to="/flashcards"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-white font-semibold text-xs transition-all shadow-md"
              >
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Pattern Flashcards</span>
              </Link>

              <Link
                to="/visualizer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-white font-semibold text-xs transition-all shadow-md"
              >
                <PlayCircle className="w-4 h-4 text-cyan-400" />
                <span>Interactive Visualizer</span>
              </Link>

              <Link
                to="/cheatsheet"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-white font-semibold text-xs transition-all shadow-md"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>FAANG Cheat Sheet</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Grid Features */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Engineered for Technical Interview Mastery
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Every tool and view is crafted around pedagogical clarity and depth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Multiple Approaches */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Triple-Approach Evolution</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                See solutions evolve from quadratic Brute Force, to log-linear Better, to peak Optimal runtime. Master the trade-offs interviewers test you on.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                <span>Brute Force</span>
                <span>→</span>
                <span>Better</span>
                <span>→</span>
                <span className="text-emerald-400">Optimal O(n)</span>
              </div>
            </div>

            {/* Card 2: Interactive Dry Run */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Interactive Dry Run Tracing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Step through algorithm execution with variable state tables. Never struggle to debug tricky two-pointer or dynamic programming boundary steps.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Variable Trace Table</span>
              </div>
            </div>

            {/* Card 3: AI Mentor Chat */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Anchored AI Mentor</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ask questions right alongside the code. Ask "Why didn't we use recursion?", "Can we optimize space?", or request a line-by-line explanation.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-purple-400 font-semibold">
                <Zap className="w-4 h-4" />
                <span>Unlimited free follow-up chats</span>
              </div>
            </div>

            {/* Card 4: Code Playground */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">In-Browser Code Playground</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Write and test code instantly against test cases. Compare your implementation directly with AlgoCraft's generated optimal code.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <Terminal className="w-4 h-4" />
                <span>Multi-language code execution</span>
              </div>
            </div>

            {/* Card 5: Topic Roadmap */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Curated Topic Roadmap</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Follow a proven structured path: Arrays & Hashing → Two Pointers → Sliding Window → Trees → Dynamic Programming.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                <Brain className="w-4 h-4" />
                <span>Structured path to interview confidence</span>
              </div>
            </div>

            {/* Card 6: 100% Free Guarantee */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">100% Free Forever</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                No credit tokens, no billing packs, no subscriptions. Everything is unlocked and unlimited for placement aspirants and competitive programmers.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>Zero paywalls. Unlimited generations.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-indigo-900/40 via-slate-900 to-emerald-900/30 border border-indigo-500/30 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to upgrade your DSA problem-solving?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
            Launch the Problem Studio now and get an instant, deep pedagogical breakdown for any coding challenge.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to="/studio"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all"
            >
              Open Problem Studio
            </Link>
            <Link
              to="/roadmap"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-base transition-colors"
            >
              View Topic Roadmap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
