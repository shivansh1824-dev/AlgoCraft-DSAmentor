import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Timer,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Building2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  Award,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import axios from "axios";

export default function InterviewPage() {
  const navigate = useNavigate();

  // Screen state: "setup" | "interview" | "debrief"
  const [screenState, setScreenState] = useState("setup");

  // Setup options
  const [company, setCompany] = useState("Google");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState(30); // minutes
  const [language, setLanguage] = useState("C++");

  // Session state
  const [session, setSession] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [code, setCode] = useState("");
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [activeHintIndex, setActiveHintIndex] = useState(null);

  // Evaluation & Debrief state
  const [evaluating, setEvaluating] = useState(false);
  const [debrief, setDebrief] = useState(null);

  const companies = ["Google", "Amazon", "Meta", "Microsoft", "Uber", "Apple"];

  // Countdown timer
  useEffect(() => {
    let interval = null;
    if (screenState === "interview" && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screenState, secondsLeft]);

  // Start interview session
  const handleStartInterview = async () => {
    try {
      const res = await axios.post("/api/interview/start", {
        company,
        difficulty,
        duration
      });

      if (res.data?.session) {
        setSession(res.data.session);
        setSecondsLeft(duration * 60);
        const starter =
          res.data.session.problem?.starterCode?.[language] ||
          res.data.session.problem?.starterCode?.["C++"] ||
          "// Implement your solution here\n";
        setCode(starter);
        setHintsRevealed(0);
        setActiveHintIndex(null);
        setScreenState("interview");
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
    }
  };

  // Reveal next progressive hint
  const handleRevealNextHint = () => {
    if (hintsRevealed < (session?.problem?.hints?.length || 3)) {
      setHintsRevealed((prev) => prev + 1);
      setActiveHintIndex(hintsRevealed);
    }
  };

  // Submit interview for AI evaluation
  const handleSubmitInterview = async () => {
    if (!session) return;
    setEvaluating(true);

    const timeSpent = duration * 60 - secondsLeft;

    try {
      const res = await axios.post("/api/interview/submit", {
        problemTitle: session.problem?.title,
        code,
        language,
        timeSpentSeconds: timeSpent,
        hintsUsed: hintsRevealed
      });

      if (res.data?.debrief) {
        setDebrief(res.data.debrief);
        setScreenState("debrief");
      }
    } catch (err) {
      console.error("Submission evaluation failed:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isUrgent = secondsLeft < 300; // < 5 mins

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Accent */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* SETUP SCREEN */}
      {screenState === "setup" && (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              <Timer className="w-3.5 h-3.5" />
              <span>Real FAANG Technical Interview Simulation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Mock Technical Interview
            </h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Simulate an authentic high-pressure phone screen. Timed problem presentation, progressive hints, and an AI Bar Raiser debrief score.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            {/* Target Company Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Target Company</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {companies.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCompany(c)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      company === c
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Difficulty</label>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        difficulty === d
                          ? "bg-slate-800 border-indigo-500 text-indigo-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Duration</label>
                <div className="flex gap-2">
                  {[20, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        duration === mins
                          ? "bg-slate-800 border-indigo-500 text-indigo-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="C++">C++</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="JavaScript">JavaScript</option>
                </select>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-4">
              <button
                onClick={handleStartInterview}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-indigo-600 to-emerald-600 hover:from-rose-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Enter Interview Room ({company} • {duration} Minutes)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE INTERVIEW SCREEN */}
      {screenState === "interview" && session && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Bar with Timer */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                {session.company} Interview
              </span>
              <span className="text-sm font-bold text-white">{session.problem?.title}</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                  session.problem?.difficulty === "Hard"
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}
              >
                {session.problem?.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-base transition-colors ${
                  isUrgent
                    ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                    : "bg-slate-800 border-slate-700 text-slate-200"
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>{formatTimer(secondsLeft)}</span>
              </div>

              <button
                onClick={handleSubmitInterview}
                disabled={evaluating}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {evaluating ? "Evaluating..." : "Submit Code"}
              </button>
            </div>
          </div>

          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Problem & Hints */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-md max-h-[680px] overflow-y-auto">
                <h3 className="text-base font-bold text-white">Problem Statement</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {session.problem?.description}
                </p>

                {/* Examples */}
                {session.problem?.examples && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Examples</h4>
                    {session.problem.examples.map((ex, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                        <div className="text-slate-300"><span className="text-indigo-400">Input:</span> {ex.input}</div>
                        <div className="text-emerald-400"><span className="text-slate-400">Output:</span> {ex.output}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {session.problem?.constraints && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Constraints</h4>
                    <p className="text-xs text-slate-400 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      {session.problem.constraints}
                    </p>
                  </div>
                )}

                {/* Progressive Hints Ladder */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Progressive Hints ({hintsRevealed}/3 revealed)</span>
                    </h4>
                    {hintsRevealed < 3 && (
                      <button
                        onClick={handleRevealNextHint}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 cursor-pointer"
                      >
                        Reveal Hint #{hintsRevealed + 1}
                      </button>
                    )}
                  </div>

                  {session.problem?.hints?.slice(0, hintsRevealed).map((hint, hIdx) => (
                    <div
                      key={hIdx}
                      className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed animate-in fade-in"
                    >
                      <span className="font-bold text-amber-400 mr-1.5">Hint {hIdx + 1}:</span>
                      {hint}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Code Editor & Execution */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Editor ({language})</span>
                  </div>
                  <span className="text-xs text-slate-500">Auto-saves locally</span>
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={20}
                  className="w-full p-4 bg-[#090D16] text-slate-100 font-mono text-sm leading-relaxed focus:outline-none resize-none"
                  spellCheck="false"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEBRIEF MODAL / SCREEN */}
      {screenState === "debrief" && debrief && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl space-y-6">
            {/* Header / Score Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>Official FAANG Bar Raiser Verdict</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  Decision:{" "}
                  <span
                    className={
                      debrief.verdict === "Strong Hire"
                        ? "text-emerald-400"
                        : debrief.verdict === "Hire"
                        ? "text-indigo-400"
                        : "text-amber-400"
                    }
                  >
                    {debrief.verdict}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Problem: {session?.problem?.title} ({session?.company} Simulation)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/40 bg-emerald-500/10 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-white">{debrief.score}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">/ 100</span>
                </div>
              </div>
            </div>

            {/* Subscores Grid */}
            {debrief.subscores && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(debrief.subscores).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <div className="text-lg font-black text-white">{val}</div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Interviewer Notes */}
            {debrief.interviewerNotes && (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200/90 leading-relaxed">
                <span className="font-bold text-indigo-300 block mb-1">Interviewer Notes:</span>
                {debrief.interviewerNotes}
              </div>
            )}

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Strengths</span>
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {debrief.strengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Growth Areas</span>
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {debrief.improvements?.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setScreenState("setup")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Try Another Interview
              </button>
              <button
                onClick={() =>
                  navigate("/studio", {
                    state: { initialProblem: session?.problem?.title }
                  })
                }
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deconstruct in Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
