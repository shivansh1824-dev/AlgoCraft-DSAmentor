import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Sliders,
  Code2,
  Terminal,
  Cpu,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  Tag,
  Loader2
} from "lucide-react";
import axios from "axios";

export default function StudioPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: location.state?.initialProblem || "",
    platform: "LeetCode",
    url: "",
    topic: location.state?.topic || "Arrays & Hashing",
    difficulty: location.state?.difficulty || "Medium",
    language: "C++",
    stuckPoint: "",
    mode: "multipleApproaches",
    depth: "detailed",
  });

  // Section Toggles
  const [toggles, setToggles] = useState({
    bruteForce: true,
    optimal: true,
    intuition: true,
    dryRun: true,
    edgeCases: true,
    commonMistakes: true,
    interviewTips: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);

  // URL Auto-Parser State
  const [urlInput, setUrlInput] = useState("");
  const [parsingUrl, setParsingUrl] = useState(false);
  const [urlSuccessNotice, setUrlSuccessNotice] = useState(null);

  const handleAutoParseUrl = async (targetUrl) => {
    const urlToParse = targetUrl || urlInput;
    if (!urlToParse || !urlToParse.trim()) return;

    setParsingUrl(true);
    setUrlSuccessNotice(null);
    setError(null);

    try {
      const res = await axios.post("/api/parse-url", { url: urlToParse.trim() });
      if (res.data?.metadata) {
        const meta = res.data.metadata;
        setFormData((prev) => ({
          ...prev,
          name: meta.name || prev.name,
          platform: meta.platform || prev.platform,
          url: meta.url || prev.url,
          topic: meta.topic || prev.topic,
          difficulty: meta.difficulty || prev.difficulty,
          stuckPoint: meta.summary
            ? prev.stuckPoint
              ? `${prev.stuckPoint}\n\nProblem Description:\n${meta.summary}`
              : `Problem Description:\n${meta.summary}`
            : prev.stuckPoint
        }));

        setUrlInput(meta.url || urlToParse);

        setUrlSuccessNotice({
          name: meta.name,
          platform: meta.platform,
          difficulty: meta.difficulty,
          topic: meta.topic
        });

        setTimeout(() => setUrlSuccessNotice(null), 7000);
      }
    } catch (err) {
      console.error("URL Auto-parse failed:", err);
      setError("Could not auto-detect problem from URL. You can still enter details manually.");
    } finally {
      setParsingUrl(false);
    }
  };

  const platforms = [
    "LeetCode",
    "GeeksforGeeks",
    "Codeforces",
    "CodeChef",
    "HackerRank",
    "InterviewBit",
    "Other"
  ];

  const topics = [
    "Arrays & Hashing",
    "Two Pointers",
    "Sliding Window",
    "Stack & Queues",
    "Binary Search",
    "Linked List",
    "Trees & BST",
    "Graphs & BFS/DFS",
    "Dynamic Programming",
    "Greedy Algorithms",
    "Backtracking",
    "Trie & Advanced DSA"
  ];

  const languages = ["C++", "Java", "Python", "JavaScript", "TypeScript", "C"];

  const loadingSteps = [
    "Analyzing problem constraints & problem signature...",
    "Synthesizing mental models & intuition...",
    "Formulating Brute Force, Better, and Optimal approaches...",
    "Constructing variable state table for Dry Run...",
    "Compiling interview tips & edge-case safety checks..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1200);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter a problem name.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await axios.post("/api/generate", {
        ...formData,
        toggles
      });

      if (response.data?.solution) {
        navigate(`/solution/${response.data.solution._id || "latest"}`, {
          state: { solution: response.data.solution }
        });
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError("Failed to generate breakdown. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Studio Ambient Header Glow & Subtle Backdrop */}
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none -z-10 overflow-hidden opacity-20 mask-radial-fade">
        <img 
          src="/images/cyber_grid_bg.jpg" 
          alt="Studio Cyber Backdrop" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>100% Free DSA Generation • No Credit Limits</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Problem Deconstruction Studio
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Enter any DSA question and configure your preferred breakdown mode. AlgoCraft generates a complete conceptual masterclass in seconds.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-6 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Deconstructing "{formData.name}"</h3>
            <p className="text-sm text-indigo-400 font-medium transition-all duration-300">
              {loadingSteps[loadingStep]}
            </p>
          </div>
          {/* Progress bar */}
          <div className="max-w-md mx-auto h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* URL Auto-Import Quick Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Auto-Import from LeetCode / GFG / Codeforces URL</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                Auto-fills title, topic, difficulty & constraints
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste problem link: e.g. https://leetcode.com/problems/trapping-rain-water/"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAutoParseUrl(urlInput)}
                disabled={parsingUrl || !urlInput.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                {parsingUrl ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-Parsing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill Form</span>
                  </>
                )}
              </button>
            </div>

            {urlSuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Successfully auto-filled: <strong>{urlSuccessNotice.name}</strong> ({urlSuccessNotice.difficulty} • {urlSuccessNotice.topic} • {urlSuccessNotice.platform})
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Imported
                </span>
              </div>
            )}
          </div>

          {/* Problem Basics Section */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              Problem Basics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Problem Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Two Sum, Trapping Rain Water, Course Schedule"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Origin Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL (Optional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Problem URL (Optional)
                  </label>
                  {formData.url && (
                    <button
                      type="button"
                      onClick={() => handleAutoParseUrl(formData.url)}
                      disabled={parsingUrl}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Detect Metadata</span>
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => {
                    setFormData({ ...formData, url: e.target.value });
                    setUrlInput(e.target.value);
                  }}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Target Language */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Target Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {languages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Easy", "Medium", "Hard"].map((diff) => {
                  const active = formData.difficulty === diff;
                  const color =
                    diff === "Easy"
                      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                      : diff === "Medium"
                      ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
                      : "text-red-400 border-red-500/40 bg-red-500/10";

                  return (
                    <button
                      type="button"
                      key={diff}
                      onClick={() => setFormData({ ...formData, difficulty: diff })}
                      className={`py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        active
                          ? color + " shadow-md ring-1 ring-current"
                          : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Badges */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Primary DSA Category
              </label>
              <div className="flex flex-wrap gap-2">
                {topics.map((top) => {
                  const active = formData.topic === top;
                  return (
                    <button
                      type="button"
                      key={top}
                      onClick={() => setFormData({ ...formData, topic: top })}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        active
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-semibold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {top}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pedagogy & Tuning Section */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Pedagogical Tuning & Output Mode
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Solution Mode */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Solution Mode
                </label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="multipleApproaches">Triple Evolution (Brute → Better → Optimal)</option>
                  <option value="directOptimal">Direct Optimal Deep Dive</option>
                  <option value="intuitionFirst">Step-by-Step Intuition Builder</option>
                  <option value="interviewHint">Socratic Interview Hint Mode</option>
                </select>
              </div>

              {/* Depth */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Explanation Depth
                </label>
                <select
                  value={formData.depth}
                  onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="detailed">Detailed (Code, Dry Run & Complexity Proofs)</option>
                  <option value="quick">Quick Executive Summary (Key Aha-Moments)</option>
                  <option value="deepDive">Deep Dive Masterclass (Math Invariants & Alternatives)</option>
                </select>
              </div>
            </div>

            {/* Stuck Point Context */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Where Are You Stuck? (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.stuckPoint}
                onChange={(e) => setFormData({ ...formData, stuckPoint: e.target.value })}
                placeholder="e.g. 'I understand the O(n log n) sorting method, but how does the hash map track indices in O(1) without duplicate collisions?'"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Toggleable Sections */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Include Breakdown Sections:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "intuition", label: "Intuition & Mental Model" },
                  { key: "bruteForce", label: "Brute Force Baseline" },
                  { key: "optimal", label: "Optimal Solution" },
                  { key: "dryRun", label: "Dry Run Trace Table" },
                  { key: "edgeCases", label: "Edge Cases Checklist" },
                  { key: "commonMistakes", label: "Common Traps" },
                  { key: "interviewTips", label: "Interview Tips" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={toggles[item.key]}
                      onChange={(e) =>
                        setToggles({ ...toggles, [item.key]: e.target.checked })
                      }
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400">
              <span>⚡ Powered by Gemini AI & AlgoCraft Fallback Engine</span>
              <span className="mx-2">•</span>
              <span className="text-emerald-400 font-semibold">100% Free Forever</span>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              Generate Complete Breakdown
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
