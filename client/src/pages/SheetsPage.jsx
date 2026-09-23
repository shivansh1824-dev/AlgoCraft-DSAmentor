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
  Download,
  UploadCloud,
  FileUp,
  FileText,
  Check,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import { exportSheetMarkdown } from "../utils/exportUtils.js";
import { extractTextFromPDF } from "../utils/pdfExtractor.js";

export default function SheetsPage() {
  const navigate = useNavigate();

  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewSheetModalOpen, setIsNewSheetModalOpen] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState("");
  const [newSheetDesc, setNewSheetDesc] = useState("");

  // Custom Sheet Import state (PDF, CSV/Text, JSON)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState("pdf"); // 'pdf' | 'paste' | 'json'
  const [importTitle, setImportTitle] = useState("");
  const [importText, setImportText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

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

  const saveCustomSheetsLocally = (sheetsList) => {
    try {
      const customOnly = sheetsList.filter((s) => !s.isTemplate);
      localStorage.setItem("algocraft_custom_sheets", JSON.stringify(customOnly));
    } catch (e) {}
  };

  const fetchSheets = async () => {
    setLoading(true);
    let serverSheets = [];
    try {
      const res = await axios.get("/api/sheets");
      if (res.data?.sheets) {
        serverSheets = res.data.sheets;
      }
    } catch (err) {
      console.warn("Server sheets offline, loading from local storage:", err.message);
    }

    // Merge with locally saved custom sheets
    let localCustom = [];
    try {
      localCustom = JSON.parse(localStorage.getItem("algocraft_custom_sheets") || "[]");
    } catch (e) {}

    const mergedMap = new Map();
    [...localCustom, ...serverSheets].forEach((s) => {
      if (s && s._id) mergedMap.set(s._id, s);
    });

    const finalSheets = Array.from(mergedMap.values());
    setSheets(finalSheets);
    if (!selectedSheetId && finalSheets.length > 0) {
      setSelectedSheetId(finalSheets[0]._id);
    }
    setLoading(false);
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
    saveCustomSheetsLocally(updatedSheets);

    try {
      await axios.patch(`/api/sheets/${currentSheet._id}/toggle`, {
        sectionId,
        problemId,
        completed: !currentStatus
      });
    } catch (err) {
      console.error("Failed to sync toggle to backend:", err);
    }
  };

  // Create new blank sheet
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
        const updated = [res.data.sheet, ...sheets];
        setSheets(updated);
        setSelectedSheetId(res.data.sheet._id);
        saveCustomSheetsLocally(updated);
        setNewSheetTitle("");
        setNewSheetDesc("");
        setIsNewSheetModalOpen(false);
      }
    } catch (err) {
      // Local fallback creation if backend offline
      const localSheet = {
        _id: "sheet_local_" + Date.now(),
        title: newSheetTitle.trim(),
        description: newSheetDesc.trim(),
        isTemplate: false,
        sections: [
          {
            id: "sec_" + Date.now(),
            title: "Arrays & Core Patterns",
            problems: []
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const updated = [localSheet, ...sheets];
      setSheets(updated);
      setSelectedSheetId(localSheet._id);
      saveCustomSheetsLocally(updated);
      setNewSheetTitle("");
      setNewSheetDesc("");
      setIsNewSheetModalOpen(false);
    }
  };

  // Import from PDF
  const handleImportPdf = async () => {
    if (!pdfFile) {
      setImportError("Please select a PDF file first.");
      return;
    }
    setImportLoading(true);
    setImportError("");
    setImportStatus("Extracting text and decoding PDF streams...");

    try {
      const extractedText = await extractTextFromPDF(pdfFile);
      if (!extractedText || extractedText.length < 20) {
        throw new Error("Could not extract readable problem text from this PDF. You can paste the problem names directly into the Quick Paste tab.");
      }

      setImportStatus(`Analyzing ${extractedText.length} characters with AI curriculum parser...`);

      const res = await axios.post("/api/sheets/ai-extract", {
        text: extractedText,
        title: importTitle.trim() || pdfFile.name.replace(/\.pdf$/i, ""),
        filename: pdfFile.name
      });

      if (res.data?.sheet) {
        const newSheet = res.data.sheet;
        const updated = [newSheet, ...sheets];
        setSheets(updated);
        setSelectedSheetId(newSheet._id);
        saveCustomSheetsLocally(updated);
        setIsImportModalOpen(false);
        setPdfFile(null);
        setImportTitle("");
        setImportSuccess(`Imported "${newSheet.title}" with ${newSheet.sections?.reduce((a, s) => a + s.problems.length, 0)} problems across ${newSheet.sections?.length} topics!`);
        setTimeout(() => setImportSuccess(""), 5000);
      } else {
        throw new Error("Failed to structure sheet from PDF.");
      }
    } catch (err) {
      console.error("PDF import error:", err);
      setImportError(err.response?.data?.error || err.message);
    } finally {
      setImportLoading(false);
      setImportStatus("");
    }
  };

  // Import from Pasted Text / CSV
  const handleImportText = async () => {
    if (!importText.trim()) {
      setImportError("Please paste problem names or lines first.");
      return;
    }
    setImportLoading(true);
    setImportError("");
    setImportStatus("Clustering problems into topic-wise sections...");

    try {
      const res = await axios.post("/api/sheets/ai-extract", {
        text: importText.trim(),
        title: importTitle.trim() || "Custom DSA Sheet"
      });

      if (res.data?.sheet) {
        const newSheet = res.data.sheet;
        const updated = [newSheet, ...sheets];
        setSheets(updated);
        setSelectedSheetId(newSheet._id);
        saveCustomSheetsLocally(updated);
        setIsImportModalOpen(false);
        setImportText("");
        setImportTitle("");
        setImportSuccess(`Created "${newSheet.title}" with ${newSheet.sections?.reduce((a, s) => a + s.problems.length, 0)} problems!`);
        setTimeout(() => setImportSuccess(""), 5000);
      } else {
        throw new Error("Could not parse problem list.");
      }
    } catch (err) {
      console.error("Text import error:", err);
      setImportError(err.response?.data?.error || err.message);
    } finally {
      setImportLoading(false);
      setImportStatus("");
    }
  };

  // Import JSON File
  const handleImportJson = (e) => {
    setImportError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.title || !Array.isArray(parsed.sections)) {
          throw new Error("Invalid AlgoCraft JSON schema: must include 'title' and 'sections' array.");
        }

        const res = await axios.post("/api/sheets", {
          title: parsed.title,
          description: parsed.description || "Imported JSON sheet",
          sections: parsed.sections
        });

        if (res.data?.sheet) {
          const updated = [res.data.sheet, ...sheets];
          setSheets(updated);
          setSelectedSheetId(res.data.sheet._id);
          saveCustomSheetsLocally(updated);
          setIsImportModalOpen(false);
          setImportSuccess(`Imported "${res.data.sheet.title}"!`);
          setTimeout(() => setImportSuccess(""), 4000);
        }
      } catch (err) {
        setImportError("JSON parsing failed: " + err.message);
      }
    };
    reader.readAsText(file);
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
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setImportError("");
              setImportSuccess("");
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-indigo-500/50 font-medium text-sm shadow-md transition-all cursor-pointer"
            title="Upload PDF, CSV or JSON Sheet"
          >
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <span>Import Sheet (PDF / Text)</span>
          </button>

          <button
            onClick={() => setIsNewSheetModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Blank Sheet</span>
          </button>
        </div>
      </div>

      {/* Import Success Banner */}
      {importSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{importSuccess}</span>
          </div>
          <button onClick={() => setImportSuccess("")} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                              title="Breakdown problem with AlgoCraft AI"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span className="hidden sm:inline">Solve</span>
                            </button>

                            {/* Open in Code Editor Button */}
                            <button
                              onClick={() => {
                                navigate("/playground", {
                                  state: {
                                    initialProblem: problem.name,
                                    difficulty: problem.difficulty,
                                    platform: problem.platform || "LeetCode"
                                  }
                                });
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                              title="Open in Code Editor with platform boilerplate"
                            >
                              <Code2 className="w-3 h-3 text-slate-400" />
                              <span className="hidden md:inline">Code</span>
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

      {/* Import Custom Sheet Modal (PDF, Paste, JSON) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Import Custom DSA Sheet</h3>
                  <p className="text-xs text-slate-400">Add external sheets to track progress and solve in Studio</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!importLoading) setIsImportModalOpen(false);
                }}
                className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Supported Formats Info Banner */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Supported Sheet Formats</span>
              </div>
              <ul className="text-slate-400 space-y-1 list-disc pl-4">
                <li><strong className="text-slate-300">PDF (.pdf):</strong> Striver's SDE Sheet, Love Babbar 450, NeetCode, Blind 75, or college PDFs. AI auto-extracts problems and clusters them by topic.</li>
                <li><strong className="text-slate-300">Quick Paste / CSV:</strong> Paste problem titles line-by-line or formatted as <code>Problem, Topic, Difficulty, Platform</code>.</li>
                <li><strong className="text-slate-300">JSON (.json):</strong> Native AlgoCraft sheet JSON format.</li>
              </ul>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setImportTab("pdf"); setImportError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  importTab === "pdf"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>PDF Auto-Analysis</span>
              </button>

              <button
                type="button"
                onClick={() => { setImportTab("paste"); setImportError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  importTab === "paste"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Quick Paste / CSV</span>
              </button>

              <button
                type="button"
                onClick={() => { setImportTab("json"); setImportError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  importTab === "json"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>JSON Import</span>
              </button>
            </div>

            {/* Error Banner */}
            {importError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* TAB 1: PDF Upload */}
            {importTab === "pdf" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Sheet Title (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Striver's SDE Sheet 2026"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                    className="w-full bg-slate-800 text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 text-center transition-colors bg-slate-800/30">
                  <input
                    type="file"
                    id="pdf-upload-input"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPdfFile(file);
                        if (!importTitle) setImportTitle(file.name.replace(/\.pdf$/i, ""));
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="pdf-upload-input" className="cursor-pointer space-y-2 block">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                      <FileUp className="w-6 h-6" />
                    </div>
                    {pdfFile ? (
                      <div>
                        <div className="text-sm font-semibold text-white truncate max-w-xs mx-auto">
                          {pdfFile.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {(pdfFile.size / 1024).toFixed(1)} KB · Click to change file
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Click to select or drag & drop DSA PDF
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Supports multi-page problem sheets up to 25MB
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                {importLoading && (
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2.5 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>{importStatus || "Analyzing PDF and extracting problems..."}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    disabled={importLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportPdf}
                    disabled={!pdfFile || importLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    {importLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Extract & Create Sheet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Quick Paste / CSV */}
            {importTab === "paste" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Sheet Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Blind 75 Sprint"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                    className="w-full bg-slate-800 text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Paste Problems (one per line, numbered or CSV)
                  </label>
                  <textarea
                    placeholder="Example:&#10;1. Two Sum - Easy - LeetCode&#10;2. Best Time to Buy and Sell Stock - Easy - LeetCode&#10;3. Contains Duplicate - Easy - LeetCode&#10;4. Maximum Subarray - Medium - LeetCode&#10;5. Reverse Linked List - Easy - LeetCode"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-800 text-xs font-mono text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {importLoading && (
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2.5 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>{importStatus || "Clustering problems into topics..."}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    disabled={importLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportText}
                    disabled={!importText.trim() || importLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    {importLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Clustering Problems...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Sheet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: JSON File Import */}
            {importTab === "json" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Select a standard AlgoCraft sheet JSON file exported from another account or backup.
                </p>

                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 text-center transition-colors bg-slate-800/30">
                  <input
                    type="file"
                    id="json-upload-input"
                    accept=".json,application/json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                  <label htmlFor="json-upload-input" className="cursor-pointer space-y-2 block">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Click to choose .json sheet file
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Must contain "title" and "sections" array
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
