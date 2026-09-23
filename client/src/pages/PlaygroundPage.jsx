import React, { useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Code2,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  FileCode,
  Lightbulb,
  ChevronDown,
  Sparkles,
  Clock,
  HardDrive,
  Terminal,
  Info,
  ArrowRight,
  BookOpen,
  AlertTriangle
} from "lucide-react";

// ─── Platform-aware template library ─────────────────────────────────────────

/**
 * Generates a platform-correct function signature template for a given language.
 * Used when the solution doesn't supply a platformTemplate.
 */
const inferTemplate = (problemName, language, platform) => {
  const fn = (problemName || "solve")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");

  const templates = {
    "C++": `#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    // TODO: Fill in the correct return type, function name, and parameters\n    // for "${problemName}" on ${platform}\n    int ${fn}(vector<int>& nums) {\n        // ✏️ Write your solution here\n        \n    }\n};`,
    "Java": `import java.util.*;\n\nclass Solution {\n    // TODO: Fill in the correct return type, function name, and parameters\n    // for "${problemName}" on ${platform}\n    public int ${fn}(int[] nums) {\n        // ✏️ Write your solution here\n        return 0;\n    }\n}`,
    "Python": `from typing import List, Dict, Optional, Tuple\n\nclass Solution:\n    # TODO: Fill in the correct function name and parameters\n    # for "${problemName}" on ${platform}\n    def ${fn}(self, nums: List[int]) -> int:\n        # ✏️ Write your solution here\n        pass`,
    "JavaScript": `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar ${fn} = function(nums) {\n    // ✏️ Write your solution here\n    \n};`,
    "TypeScript": `function ${fn}(nums: number[]): number {\n    // ✏️ Write your solution here\n    \n}`,
    "C": `#include <stdlib.h>\n#include <string.h>\n\n/* TODO: Fill in return type and parameters for "${problemName}" */\nint ${fn}(int* nums, int numsSize) {\n    /* ✏️ Write your solution here */\n    return 0;\n}`
  };

  return templates[language] || templates["C++"];
};

// ─── Language config ──────────────────────────────────────────────────────────

const LANGUAGES = [
  { id: "C++",        label: "C++",          ext: "cpp",  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30" },
  { id: "Java",       label: "Java",         ext: "java", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  { id: "Python",     label: "Python",       ext: "py",   color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  { id: "JavaScript", label: "JavaScript",   ext: "js",   color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30" },
  { id: "TypeScript", label: "TypeScript",   ext: "ts",   color: "text-sky-400",    bg: "bg-sky-500/10 border-sky-500/30" },
  { id: "C",          label: "C",            ext: "c",    color: "text-slate-300",  bg: "bg-slate-500/10 border-slate-500/30" }
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const location = useLocation();

  // Data passed from SolutionResultPage or used standalone
  const solution = location.state?.solution || null;
  const problem = solution?.problem || null;
  const content = solution?.content || null;

  const initialLang = location.state?.language || problem?.language || "C++";
  const [language, setLanguage] = useState(initialLang);
  const [copied, setCopied] = useState(false);
  const [expandedHints, setExpandedHints] = useState(true);

  // Determine which template to show for the current language
  const getTemplate = useCallback((lang) => {
    const platformTemplate = content?.platformTemplate;
    if (platformTemplate) {
      const key = lang.toLowerCase().replace(/[^a-z]/g, "").replace("typescript", "typescript");
      const langKey = { "c++": "cpp", "java": "java", "python": "python", "javascript": "javascript", "typescript": "typescript", "c": "c" }[lang.toLowerCase()] || "cpp";
      if (platformTemplate[langKey]) return platformTemplate[langKey];
    }
    return inferTemplate(problem?.name || "Your Problem", lang, problem?.platform || "LeetCode");
  }, [content, problem]);

  const [code, setCode] = useState(() => getTemplate(initialLang));

  const handleLangChange = (lang) => {
    setLanguage(lang);
    setCode(getTemplate(lang));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(getTemplate(language));
  };

  const handleOpenPlatform = () => {
    if (problem?.url) {
      window.open(problem.url, "_blank", "noopener,noreferrer");
    }
  };

  const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];
  const approaches = content?.approaches || [];
  const optimalApproach = approaches.find(a => a.level === "Optimal") || approaches[approaches.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Code Editor
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Platform Template
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {problem
                  ? <>Ready-to-submit template for <span className="text-white font-semibold">{problem.name}</span> · {problem.platform}</>
                  : "Platform-correct function templates. Fill in the body and submit."}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {problem?.url && (
            <button
              onClick={handleOpenPlatform}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-xs font-semibold transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              Open on {problem.platform}
            </button>
          )}

          {solution?._id && (
            <Link
              to={`/solution/${solution._id}`}
              state={{ solution }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              View Full Breakdown
            </Link>
          )}

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              copied
                ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400"
                : "bg-indigo-600 hover:bg-indigo-500 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>

      {/* ── Language Switcher ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">Language:</span>
        {LANGUAGES.map((lang) => {
          const active = language === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => handleLangChange(lang.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                active
                  ? `${lang.bg} ${lang.color}`
                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Code2 className={`w-3 h-3 ${active ? lang.color : "text-slate-500"}`} />
              {lang.label}
            </button>
          );
        })}
      </div>

      {/* ── Main Editor + Info Panel ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Code Template Editor (2 cols) ──────────────────────────── */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[540px]">

          {/* Editor toolbar */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${currentLang.color.replace("text-", "bg-")}`} />
                <span className="font-mono text-xs text-slate-300 font-semibold">
                  solution.{currentLang.ext}
                </span>
              </div>
              {problem && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {problem.name} · {problem.platform}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className={`px-2 py-0.5 rounded-full border font-semibold ${currentLang.bg} ${currentLang.color}`}>
                {language}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">LeetCode / GFG Ready</span>
            </div>
          </div>

          {/* Code textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            className="w-full flex-1 bg-[#090D16] p-5 text-xs sm:text-sm font-mono text-slate-100 leading-relaxed focus:outline-none resize-none border-none tab-size-2"
            style={{ tabSize: 2 }}
            placeholder="Your code template will appear here..."
          />

          {/* Editor footer */}
          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
            <span>✏️ Fill in the function body above, then copy to {problem?.platform || "LeetCode / GFG"}</span>
            <span>{code.split("\n").length} lines</span>
          </div>
        </div>

        {/* ── Right: Info Panel (1 col) ─────────────────────────────────────── */}
        <div className="space-y-4 flex flex-col">

          {/* How to use card */}
          <div className="glass-panel rounded-2xl p-4 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-slate-900/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              How to Use
            </h3>
            <ol className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Choose your language using the switcher above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Study the algorithm hints on this panel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Fill in the function body in the editor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
                <span>
                  Hit <strong className="text-white">Copy Code</strong> and paste into{" "}
                  {problem?.url ? (
                    <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">
                      {problem.platform}
                    </a>
                  ) : "LeetCode / GFG"}
                </span>
              </li>
            </ol>
          </div>

          {/* Problem metadata */}
          {problem && (
            <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Problem Info
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Name</span>
                  <span className="text-white font-semibold text-right max-w-[160px] truncate">{problem.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Platform</span>
                  <span className="text-slate-300">{problem.platform}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Difficulty</span>
                  <span className={`font-bold ${
                    problem.difficulty === "Easy" ? "text-emerald-400" :
                    problem.difficulty === "Medium" ? "text-amber-400" : "text-red-400"
                  }`}>{problem.difficulty}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Topic</span>
                  <span className="text-indigo-400">{problem.topic}</span>
                </div>
              </div>
              {problem.url && (
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  Open Problem on {problem.platform}
                </a>
              )}
            </div>
          )}

          {/* Algorithm hints from optimal approach */}
          {optimalApproach && (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <button
                onClick={() => setExpandedHints(!expandedHints)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Algorithm Hints ({optimalApproach.level})
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedHints ? "rotate-180" : ""}`} />
              </button>

              {expandedHints && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {optimalApproach.intuition}
                  </p>

                  {/* Complexity */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span className="text-slate-400">Time:</span>
                      <span className="font-mono font-bold text-white">{optimalApproach.timeComplexity || "O(n)"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <HardDrive className="w-3 h-3 text-emerald-400" />
                      <span className="text-slate-400">Space:</span>
                      <span className="font-mono font-bold text-white">{optimalApproach.spaceComplexity || "O(1)"}</span>
                    </div>
                  </div>

                  {/* Step by step */}
                  {Array.isArray(optimalApproach.stepByStep) && optimalApproach.stepByStep.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Algorithm Steps</span>
                      <ol className="space-y-1.5">
                        {optimalApproach.stepByStep.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Edge cases quick ref */}
          {Array.isArray(content?.edgeCases) && content.edgeCases.length > 0 && (
            <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Watch Out For
              </h3>
              <ul className="space-y-1.5">
                {content.edgeCases.slice(0, 3).map((ec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 flex-shrink-0 mt-1.5" />
                    <span>{ec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No solution context — standalone mode hint */}
          {!solution && (
            <div className="glass-panel rounded-2xl p-4 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-slate-900/60 space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-indigo-400 font-semibold">💡 Tip:</span> Generate a full AI breakdown from the{" "}
                <Link to="/studio" className="text-indigo-400 hover:text-indigo-300 underline font-semibold">
                  Problem Studio
                </Link>
                , then click{" "}
                <span className="text-white font-semibold">"Open in Code Editor"</span>{" "}
                to get a problem-specific template with algorithm hints here.
              </p>
              <Link
                to="/studio"
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 hover:bg-indigo-600/30 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Go to Problem Studio
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Other approaches quick reference ─────────────────────────────────── */}
      {approaches.length > 1 && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            All Approaches — Quick Reference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {approaches.map((app, i) => {
              const isOptimal = app.level === "Optimal";
              return (
                <div
                  key={i}
                  className={`rounded-xl p-4 border space-y-2 ${
                    isOptimal
                      ? "bg-emerald-950/20 border-emerald-500/25"
                      : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isOptimal ? "text-emerald-400" : "text-indigo-400"}`}>
                      {app.level}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="text-slate-500">{app.timeComplexity}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-500">{app.spaceComplexity}</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-white">{app.name}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                    {app.intuition}
                  </p>
                  {isOptimal && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ✓ Recommended
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
