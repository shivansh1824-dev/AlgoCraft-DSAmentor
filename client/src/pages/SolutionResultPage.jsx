import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Layers,
  Cpu,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Bookmark,
  MessageSquare,
  Terminal,
  ArrowLeft,
  Share2,
  Check,
  FileText,
  Save,
  Download,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Printer
} from "lucide-react";
import axios from "axios";
import CodeViewer from "../components/common/CodeViewer.jsx";
import MentorChatDrawer from "../components/chat/MentorChatDrawer.jsx";
import BigOGraphCalculator from "../components/common/BigOGraphCalculator.jsx";
import EdgeCaseStressTester from "../components/common/EdgeCaseStressTester.jsx";
import { triggerPrintableLayout } from "../utils/exportUtils.js";

export default function SolutionResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [solution, setSolution] = useState(location.state?.solution || null);
  const [loading, setLoading] = useState(!solution);
  const [activeApproachIdx, setActiveApproachIdx] = useState(0);
  const [bookmarked, setBookmarked] = useState(solution?.bookmarked || false);
  const [notes, setNotes] = useState(solution?.notes || "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Audio Speech Synthesis State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Dry Run Debugger Player State
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlayingDryRun, setIsPlayingDryRun] = useState(false);

  // Fetch solution if navigated directly via URL
  useEffect(() => {
    if (!solution && id) {
      setLoading(true);
      axios
        .get(`/api/solutions/${id}`)
        .then((res) => {
          if (res.data?.solution) {
            setSolution(res.data.solution);
            setBookmarked(res.data.solution.bookmarked);
            setNotes(res.data.solution.notes || "");
          }
        })
        .catch((err) => {
          console.error("Error fetching solution:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, solution]);

  const handleBookmarkToggle = async () => {
    if (!solution?._id) return;
    try {
      const res = await axios.post(`/api/solutions/${solution._id}/bookmark`);
      setBookmarked(res.data.bookmarked);
    } catch (e) {
      setBookmarked(!bookmarked);
    }
  };

  // Audio Voice Mentor Walkthrough
  const handleToggleAudio = () => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = `Here is the core intuition for ${solution?.problem?.name || "this problem"}. ${solution?.content?.intuition || ""}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Dry Run Auto-Stepper
  const traceSteps = solution?.content?.dryRun?.traceSteps || [];

  useEffect(() => {
    let timer = null;
    if (isPlayingDryRun && traceSteps.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= traceSteps.length - 1) {
            setIsPlayingDryRun(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isPlayingDryRun, traceSteps.length]);

  const handleSaveNotes = async () => {
    if (!solution?._id) return;
    try {
      await axios.put(`/api/solutions/${solution._id}/notes`, { notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (e) {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportMarkdown = () => {
    if (!solution || !solution.content) return;
    const { problem, content } = solution;
    let md = `# ${problem?.name || "DSA Breakdown"} (${problem?.platform || "LeetCode"})\n\n`;
    md += `**Topic:** ${problem?.topic || "DSA"} | **Difficulty:** ${problem?.difficulty || "Medium"} | **Language:** ${problem?.language || "C++"}\n\n`;
    md += `## Intuition & Mental Model\n${content.intuition || ""}\n\n`;

    (content.approaches || []).forEach((app, i) => {
      md += `## Approach ${i + 1}: ${app.level} — ${app.name}\n`;
      md += `- **Time Complexity:** ${app.timeComplexity || "O(N)"}\n`;
      md += `- **Space Complexity:** ${app.spaceComplexity || "O(1)"}\n\n`;
      md += `### Intuition\n${app.intuition || ""}\n\n`;
      if (app.stepByStep?.length) {
        md += `### Algorithm Steps\n` + app.stepByStep.map((s, idx) => `${idx + 1}. ${s}`).join("\n") + `\n\n`;
      }
      md += `### Code (${problem?.language || "C++"})\n\`\`\`${(problem?.language || "cpp").toLowerCase()}\n${app.code || ""}\n\`\`\`\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${(problem?.name || "solution").replace(/\s+/g, "_")}_AlgoCraft.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Loading solution breakdown...</p>
      </div>
    );
  }

  if (!solution || !solution.content) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Solution Not Found</h2>
        <p className="text-slate-400 text-sm">
          The requested solution breakdown could not be located.
        </p>
        <Link
          to="/studio"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
        >
          <Sparkles className="w-4 h-4" />
          Create New Breakdown
        </Link>
      </div>
    );
  }

  const { problem, content } = solution;
  const approaches = content.approaches || [];
  const currentApproach = approaches[activeApproachIdx] || approaches[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate("/studio")}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Problem Studio
        </button>

        <div className="flex items-center gap-2.5">
          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              bookmarked
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-amber-400" : ""}`} />
            <span>{bookmarked ? "Saved" : "Bookmark"}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Export Markdown Button */}
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Export solution as Markdown"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export</span>
          </button>

          {/* Print Guide Button */}
          <button
            onClick={triggerPrintableLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Print or save as PDF"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print</span>
          </button>

          {/* AI Mentor Drawer Trigger */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask AI Mentor</span>
          </button>
        </div>
      </div>

      {/* Problem Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              {problem.platform}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-md font-bold text-xs border ${
                problem.difficulty === "Easy"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : problem.difficulty === "Medium"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}
            >
              {problem.difficulty}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-medium">
              {problem.topic}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              {problem.language}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {problem.name}
          </h1>

          {problem.stuckPoint && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <span className="font-semibold">Target Stuck Point: </span>
              {problem.stuckPoint}
            </div>
          )}
        </div>
      </div>

      {/* Core Intuition Card with Voice Mentor */}
      {content.intuition && (
        <div className="glass-card rounded-2xl p-6 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 to-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Lightbulb className="w-5 h-5 text-indigo-400" />
              <span>The Core Intuition & Aha-Moment</span>
            </div>

            {/* Audio Voice Mentor Button */}
            <button
              onClick={handleToggleAudio}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isPlayingAudio
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse shadow-md shadow-rose-500/20"
                  : "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30 shadow-sm"
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Stop Audio Walkthrough</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>Listen to Intuition</span>
                </>
              )}
            </button>
          </div>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            {content.intuition}
          </p>
        </div>
      )}

      {/* Approaches Section with Tabs */}
      {approaches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Algorithmic Approaches
            </h2>
          </div>

          {/* Approach Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
            {approaches.map((app, idx) => {
              const active = activeApproachIdx === idx;
              const isOptimal = app.level === "Optimal";
              return (
                <button
                  key={idx}
                  onClick={() => setActiveApproachIdx(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    active
                      ? isOptimal
                        ? "bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500"
                        : "bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{app.level || `Approach ${idx + 1}`}</span>
                  {isOptimal && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      Recommended
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Approach Content */}
          {currentApproach && (
            <div className="space-y-6">
              {/* Approach Overview */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {currentApproach.name}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1">
                      {currentApproach.intuition}
                    </p>
                  </div>

                  {/* Complexity Pills */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Time</span>
                        <span className="font-mono font-bold text-white">
                          {currentApproach.timeComplexity || "O(n)"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs">
                      <HardDrive className="w-4 h-4 text-emerald-400" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Space</span>
                        <span className="font-mono font-bold text-white">
                          {currentApproach.spaceComplexity || "O(1)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Breakdown */}
                {Array.isArray(currentApproach.stepByStep) && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                      Execution Steps
                    </h4>
                    <ol className="space-y-2 text-sm text-slate-300">
                      {currentApproach.stepByStep.map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Complexity Justification */}
                {currentApproach.complexityReason && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <span className="font-semibold text-slate-300">Mathematical Proof: </span>
                    {currentApproach.complexityReason}
                  </div>
                )}

                {/* Trade-offs */}
                {currentApproach.tradeOffs && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <span className="font-semibold text-slate-300">Trade-offs & Constraints: </span>
                    {currentApproach.tradeOffs}
                  </div>
                )}
              </div>

              {/* Code Viewer */}
              {currentApproach.code && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      Implementation ({problem.language})
                    </h4>
                  </div>
                  <CodeViewer
                    code={currentApproach.code}
                    language={problem.language}
                    title={currentApproach.name}
                    onSendToPlayground={(code, lang) => {
                      navigate("/playground", {
                        state: {
                          code,
                          language: lang,
                          problemName: problem.name
                        }
                      });
                    }}
                  />
                  {currentApproach.codeExplanation && (
                    <p className="text-xs text-slate-400 italic px-2">
                      {currentApproach.codeExplanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dry Run Trace Table with Interactive Step Player */}
      {content.dryRun && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <span>Interactive Dry Run Debugger</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Step-by-step memory and variable trace walkthrough
              </p>
            </div>

            {/* Stepper Controls */}
            {traceSteps.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingDryRun(!isPlayingDryRun)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPlayingDryRun
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                  }`}
                >
                  {isPlayingDryRun ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Auto Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentStepIdx === 0}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Previous Step"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono font-bold text-slate-300 px-2">
                  {currentStepIdx + 1} / {traceSteps.length}
                </span>

                <button
                  onClick={() =>
                    setCurrentStepIdx((prev) => Math.min(traceSteps.length - 1, prev + 1))
                  }
                  disabled={currentStepIdx === traceSteps.length - 1}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Next Step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentStepIdx(0)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset to Step 1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {content.dryRun.inputExample && (
            <div className="text-xs text-slate-300 font-mono bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-500">Test Input: </span>
              {content.dryRun.inputExample}
            </div>
          )}

          {/* Active Step Spotlight Card */}
          {traceSteps[currentStepIdx] && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/20 border border-emerald-500/30 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Active Step {traceSteps[currentStepIdx].step}
                </span>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {traceSteps[currentStepIdx].state}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-400">Variables:</span>
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  {traceSteps[currentStepIdx].variables}
                </span>
              </div>
              <p className="text-xs text-slate-300 italic pt-1">
                {traceSteps[currentStepIdx].explanation}
              </p>
            </div>
          )}

          {/* Table Trace with Active Row Glow */}
          {Array.isArray(traceSteps) && (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#090D16]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-4 w-16">Step</th>
                    <th className="py-2.5 px-4">Variables State</th>
                    <th className="py-2.5 px-4">Condition / State</th>
                    <th className="py-2.5 px-4">Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {traceSteps.map((row, idx) => {
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <tr
                        key={idx}
                        onClick={() => setCurrentStepIdx(idx)}
                        className={`border-b border-slate-800/60 transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-emerald-500/15 font-semibold text-white border-l-4 border-l-emerald-400"
                            : "hover:bg-slate-800/30 text-slate-400"
                        }`}
                      >
                        <td className={`py-2.5 px-4 font-bold ${isCurrent ? "text-emerald-400" : "text-indigo-400"}`}>
                          {row.step}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-emerald-300">{row.variables}</td>
                        <td className={`py-2.5 px-4 ${isCurrent ? "text-slate-100" : "text-slate-300"}`}>{row.state}</td>
                        <td className={`py-2.5 px-4 ${isCurrent ? "text-slate-200" : "text-slate-400"}`}>{row.explanation}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {content.dryRun.output && (
            <div className="text-xs text-slate-300 font-mono bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-500">Final Evaluated Output:</span>
              <span className="text-emerald-400 font-bold">{content.dryRun.output}</span>
            </div>
          )}
        </div>
      )}

      {/* Visual Big-O Complexity Graph & TLE Simulator */}
      <BigOGraphCalculator approaches={approaches} problemName={problem.name} />

      {/* Feature 1: AI Code Complexity & Edge-Case Stress Matrix */}
      <EdgeCaseStressTester 
        code={currentApproach?.code || ""} 
        defaultCategory={problem?.topic || "DSA"} 
      />

      {/* Edge Cases & Common Traps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edge Cases */}
        {Array.isArray(content.edgeCases) && content.edgeCases.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Critical Edge Cases to Test
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {content.edgeCases.map((ec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                  <span>{ec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Traps */}
        {Array.isArray(content.commonMistakes) && content.commonMistakes.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Common Traps & Mistakes
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {content.commonMistakes.map((cm, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                  <span>{cm}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Interview Tips */}
      {Array.isArray(content.interviewTips) && content.interviewTips.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-slate-900 to-slate-900 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            FAANG Technical Interview Tips
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            {content.interviewTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes & Annotations Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Your Study Notes & Annotations
          </h3>
          <button
            onClick={handleSaveNotes}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{notesSaved ? "Saved!" : "Save Notes"}</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Jot down notes, personal mnemonic reminders, or company interview occurrences for this problem..."
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* AI Mentor Chat Drawer */}
      <MentorChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        solution={solution}
      />
    </div>
  );
}
