import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  ExternalLink,
  Trash2,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Zap,
  TrendingUp,
  Tag,
  Code2,
  Layers,
  X,
  Globe,
  Loader2,
  Download
} from "lucide-react";
import axios from "axios";
import { exportSheetMarkdown } from "../utils/exportUtils.js";

export default function SheetsPage() {
  const navigate = useNavigate();

  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewSheetModalOpen, setIsNewSheetModalOpen] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState("");
  const [newSheetDesc, setNewSheetDesc] = useState("");

  // Adding Section state
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // Adding Question state per section
  const [activeAddQuestionSectionId, setActiveAddQuestionSectionId] = useState(null);
  const [newQuestionData, setNewQuestionData] = useState({
    name: "",
    platform: "LeetCode",
    url: "",
    difficulty: "Medium"
  });
  const [parsingQuestionUrl, setParsingQuestionUrl] = useState(false);

  const handleParseQuestionUrl = async () => {
    if (!newQuestionData.url || !newQuestionData.url.trim()) return;
    setParsingQuestionUrl(true);
    try {
      const res = await axios.post("/api/parse-url", { url: newQuestionData.url.trim() });
      if (res.data?.metadata) {
        const meta = res.data.metadata;
        setNewQuestionData((prev) => ({
          ...prev,
          name: meta.name || prev.name,
          platform: meta.platform || prev.platform,
          difficulty: meta.difficulty || prev.difficulty
        }));
      }
    } catch (err) {
      console.error("Auto-parse failed:", err);
    } finally {
      setParsingQuestionUrl(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/sheets");
      if (res.data?.sheets) {
        setSheets(res.data.sheets);
        if (!selectedSheetId && res.data.sheets.length > 0) {
          setSelectedSheetId(res.data.sheets[0]._id);
        }
      }
    } catch (err) {
      console.error("Error loading sheets:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentSheet = sheets.find((s) => s._id === selectedSheetId) || sheets[0] || null;

  // Toggle problem completion
  const handleToggle = async (sectionId, problemId, currentStatus) => {
    if (!currentSheet) return;

    // Optimistic UI update
    const updatedSheets = sheets.map((sheet) => {
      if (sheet._id !== currentSheet._id) return sheet;
      return {
        ...sheet,
        sections: sheet.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            problems: sec.problems.map((p) => {
              if (p.id !== problemId) return p;
              return { ...p, completed: !currentStatus };
            })
          };
        })
      };
    });
    setSheets(updatedSheets);

    try {
      await axios.patch(`/api/sheets/${currentSheet._id}/toggle`, {
        sectionId,
        problemId,
        completed: !currentStatus
      });
    } catch (err) {
      console.error("Failed to toggle completion status:", err);
      fetchSheets(); // revert on error
    }
  };

  // Create new sheet
  const handleCreateSheet = async (e) => {
    e.preventDefault();
    if (!newSheetTitle.trim()) return;

    try {
      const res = await axios.post("/api/sheets", {
        title: newSheetTitle.trim(),
        description: newSheetDesc.trim(),
        sections: [
          {
            title: "Arrays & Core Patterns",
            problems: []
          }
        ]
      });

      if (res.data?.sheet) {
        setSheets([res.data.sheet, ...sheets]);
        setSelectedSheetId(res.data.sheet._id);
        setNewSheetTitle("");
        setNewSheetDesc("");
        setIsNewSheetModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to create sheet:", err);
    }
  };

  // Add section to current sheet
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim() || !currentSheet) return;

    const newSection = {
      id: "sec_" + Date.now(),
      title: newSectionTitle.trim(),
      problems: []
    };

    const updatedSections = [...(currentSheet.sections || []), newSection];

    try {
      const res = await axios.put(`/api/sheets/${currentSheet._id}`, {
        sections: updatedSections
      });
      if (res.data?.sheet) {
        setSheets(sheets.map((s) => (s._id === currentSheet._id ? res.data.sheet : s)));
        setNewSectionTitle("");
        setIsAddingSection(false);
      }
    } catch (err) {
      console.error("Failed to add section:", err);
    }
  };

  // Add question to a section
  const handleAddQuestion = async (sectionId) => {
    if (!newQuestionData.name.trim() || !currentSheet) return;

    const newProb = {
      id: "p_" + Date.now(),
      name: newQuestionData.name.trim(),
      platform: newQuestionData.platform,
      url: newQuestionData.url.trim(),
      difficulty: newQuestionData.difficulty,
      completed: false
    };

    const updatedSections = currentSheet.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        problems: [...(sec.problems || []), newProb]
      };
    });

    try {
      const res = await axios.put(`/api/sheets/${currentSheet._id}`, {
        sections: updatedSections
      });
      if (res.data?.sheet) {
        setSheets(sheets.map((s) => (s._id === currentSheet._id ? res.data.sheet : s)));
        setActiveAddQuestionSectionId(null);
        setNewQuestionData({ name: "", platform: "LeetCode", url: "", difficulty: "Medium" });
      }
    } catch (err) {
      console.error("Failed to add question:", err);
    }
  };

  // Delete problem from section
  const handleDeleteProblem = async (sectionId, problemId) => {
    if (!currentSheet) return;
    const updatedSections = currentSheet.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        problems: sec.problems.filter((p) => p.id !== problemId)
      };
    });

    try {
      const res = await axios.put(`/api/sheets/${currentSheet._id}`, {
        sections: updatedSections
      });
      if (res.data?.sheet) {
        setSheets(sheets.map((s) => (s._id === currentSheet._id ? res.data.sheet : s)));
      }
    } catch (err) {
      console.error("Failed to delete problem:", err);
    }
  };

  // Solve with AlgoCraft AI launcher
  const handleSolveWithAI = (problem) => {
    navigate("/studio", {
      state: {
        initialProblem: problem.name,
        difficulty: problem.difficulty,
        platform: problem.platform || "LeetCode"
      }
    });
  };

  // Compute Overall Stats
  const totalQuestions = currentSheet?.sections?.reduce(
    (acc, sec) => acc + (sec.problems?.length || 0),
    0
  ) || 0;

  const completedQuestions = currentSheet?.sections?.reduce(
    (acc, sec) => acc + (sec.problems?.filter((p) => p.completed)?.length || 0),
    0
  ) || 0;

  const overallPercent = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Accent */}
      <div className="absolute top-0 right-10 w-[500px] h-[350px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Problem Sheets Studio & Section Tracker</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Curated Sheets & Section Progress
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Organize problems into structured sections, track completion item-by-item, and deconstruct any problem instantly with AlgoCraft AI.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewSheetModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Sheet</span>
          </button>
        </div>
      </div>

      {/* Sheet Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {sheets.map((sheet) => (
          <button
            key={sheet._id}
            onClick={() => setSelectedSheetId(sheet._id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              selectedSheetId === sheet._id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{sheet.title}</span>
            {sheet.isTemplate && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
                Template
              </span>
            )}
          </button>
        ))}
      </div>

      {currentSheet && (
        <>
          {/* Overall Sheet Progress Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>{currentSheet.title}</span>
                  </h2>
                  <button
                    onClick={() => exportSheetMarkdown(currentSheet)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                    title="Export sheet with checkboxes to Markdown"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Export (.md)</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentSheet.description || "Personal tracking sheet"}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-2xl font-black text-white">
                    {completedQuestions} <span className="text-sm font-normal text-slate-400">/ {totalQuestions}</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-400">
                    {overallPercent}% Completed
                  </div>
                </div>

                <div className="w-14 h-14 rounded-full border-4 border-slate-800 flex items-center justify-center font-bold text-sm text-indigo-400 relative">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-500"
                      strokeDasharray={`${overallPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-white">{overallPercent}%</span>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          {/* Section Wise Breakdown Accordion */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Sections ({currentSheet.sections?.length || 0})</span>
              </h3>

              <button
                onClick={() => setIsAddingSection(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Add New Section</span>
              </button>
            </div>

            {/* Inline Add Section Form */}
            {isAddingSection && (
              <form
                onSubmit={handleAddSection}
                className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 flex items-center gap-3 animate-in fade-in"
              >
                <input
                  type="text"
                  placeholder="Section Name (e.g. Sliding Window & Two Pointers)"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="flex-1 bg-slate-800 text-sm text-white px-3.5 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Save Section
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* List of Sections */}
            {currentSheet.sections?.map((section) => {
              const secTotal = section.problems?.length || 0;
              const secCompleted = section.problems?.filter((p) => p.completed)?.length || 0;
              const secPercent = secTotal > 0 ? Math.round((secCompleted / secTotal) * 100) : 0;

              return (
                <div
                  key={section.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md overflow-hidden transition-all"
                >
                  {/* Section Header */}
                  <div className="p-4 sm:p-5 bg-slate-800/40 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-base font-bold text-white">{section.title}</h4>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                          {secCompleted}/{secTotal} Solved
                        </span>
                        {secTotal > 0 && secCompleted === secTotal && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Mastered
                          </span>
                        )}
                      </div>
                      {section.description && (
                        <p className="text-xs text-slate-400">{section.description}</p>
                      )}
                    </div>

                    {/* Section Progress Bar */}
                    <div className="flex items-center gap-3 sm:w-64">
                      <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${secPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-400 w-9 text-right">
                        {secPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Problems List in Section */}
                  <div className="divide-y divide-slate-800/50">
                    {section.problems?.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No questions in this section yet. Click below to add your first question!
                      </div>
                    ) : (
                      section.problems.map((problem) => (
                        <div
                          key={problem.id}
                          className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 transition-colors ${
                            problem.completed ? "bg-emerald-500/[0.03]" : "hover:bg-slate-800/20"
                          }`}
                        >
                          {/* Checkbox & Name */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => handleToggle(section.id, problem.id, problem.completed)}
                              className="text-slate-500 hover:text-emerald-400 transition-colors flex-shrink-0 cursor-pointer"
                            >
                              {problem.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-medium truncate ${
                                    problem.completed
                                      ? "line-through text-slate-400"
                                      : "text-slate-200"
                                  }`}
                                >
                                  {problem.name}
                                </span>
                                {problem.url && (
                                  <a
                                    href={problem.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-500 hover:text-slate-300 transition-colors"
                                    title="Open problem external URL"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Badges & Actions */}
                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            {/* Platform Pill */}
                            <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
                              {problem.platform || "LeetCode"}
                            </span>

                            {/* Difficulty Pill */}
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                                problem.difficulty === "Easy"
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : problem.difficulty === "Hard"
                                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}
                            >
                              {problem.difficulty}
                            </span>

                            {/* Solve with AI Button */}
                            <button
                              onClick={() => handleSolveWithAI(problem)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span className="hidden sm:inline">Solve with AI</span>
                            </button>

                            {/* Delete Problem */}
                            <button
                              onClick={() => handleDeleteProblem(section.id, problem.id)}
                              className="text-slate-600 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                              title="Delete problem"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Question to Section Action */}
                  <div className="p-3 bg-slate-950/40 border-t border-slate-800/60">
                    {activeAddQuestionSectionId === section.id ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-3 animate-in fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Problem Name (e.g. Two Sum)"
                            value={newQuestionData.name}
                            onChange={(e) =>
                              setNewQuestionData({ ...newQuestionData, name: e.target.value })
                            }
                            className="bg-slate-800 text-xs text-white px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
                            autoFocus
                          />
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              placeholder="Problem URL (e.g. LeetCode link)"
                              value={newQuestionData.url}
                              onChange={(e) =>
                                setNewQuestionData({ ...newQuestionData, url: e.target.value })
                              }
                              className="w-full bg-slate-800 text-xs text-white px-3 py-2 pr-20 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
                            />
                            {newQuestionData.url && (
                              <button
                                type="button"
                                onClick={handleParseQuestionUrl}
                                disabled={parsingQuestionUrl}
                                className="absolute right-1.5 px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-[10px] font-semibold text-indigo-300 hover:text-white rounded border border-indigo-500/40 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                {parsingQuestionUrl ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3" />
                                )}
                                <span>Auto-Fill</span>
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={newQuestionData.difficulty}
                              onChange={(e) =>
                                setNewQuestionData({
                                  ...newQuestionData,
                                  difficulty: e.target.value
                                })
                              }
                              className="flex-1 bg-slate-800 text-xs text-white px-2 py-2 rounded-lg border border-slate-700"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                            <select
                              value={newQuestionData.platform}
                              onChange={(e) =>
                                setNewQuestionData({
                                  ...newQuestionData,
                                  platform: e.target.value
                                })
                              }
                              className="flex-1 bg-slate-800 text-xs text-white px-2 py-2 rounded-lg border border-slate-700"
                            >
                              <option value="LeetCode">LeetCode</option>
                              <option value="GFG">GFG</option>
                              <option value="Codeforces">Codeforces</option>
                              <option value="CodeChef">CodeChef</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveAddQuestionSectionId(null)}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddQuestion(section.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Add Question
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveAddQuestionSectionId(section.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-400 px-3 py-1 rounded-lg hover:bg-slate-800/60 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question to {section.title}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* New Sheet Modal */}
      {isNewSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                <span>Create Custom Problem Sheet</span>
              </h3>
              <button
                onClick={() => setIsNewSheetModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSheet} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sheet Title *</label>
                <input
                  type="text"
                  placeholder="e.g. My 30-Day FAANG Sprint"
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  className="w-full bg-slate-800 text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description (optional)</label>
                <textarea
                  placeholder="Goals, target companies, or review schedule..."
                  value={newSheetDesc}
                  onChange={(e) => setNewSheetDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSheetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Create Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
