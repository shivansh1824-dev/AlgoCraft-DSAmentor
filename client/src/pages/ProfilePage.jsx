import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Flame,
  CheckCircle2,
  Bookmark,
  Award,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  User,
  ShieldCheck,
  Download,
  Mail
} from "lucide-react";
import axios from "axios";
import { exportProfilePortfolioMarkdown } from "../utils/exportUtils.js";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [solutions, setSolutions] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/solutions").catch(() => ({ data: { solutions: [] } })),
      axios.get("/api/sheets").catch(() => ({ data: { sheets: [] } }))
    ]).then(([solRes, sheetsRes]) => {
      if (solRes.data?.solutions) setSolutions(solRes.data.solutions);
      if (sheetsRes.data?.sheets) setSheets(sheetsRes.data.sheets);
      setLoading(false);
    });
  }, []);

  const totalDeconstructed = solutions.length;
  const bookmarkedSolutions = solutions.filter((s) => s.bookmarked);

  // Compute Sheet completed count
  const sheetCompletedCount = sheets.reduce((acc, sheet) => {
    const sheetCount = sheet.sections?.reduce((sAcc, sec) => {
      return sAcc + (sec.problems?.filter((p) => p.completed)?.length || 0);
    }, 0);
    return acc + (sheetCount || 0);
  }, 0);

  // Difficulty counts
  const easyCount = solutions.filter((s) => s.problem?.difficulty === "Easy").length;
  const medCount = solutions.filter((s) => s.problem?.difficulty === "Medium").length;
  const hardCount = solutions.filter((s) => s.problem?.difficulty === "Hard").length;

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Accent */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/30 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-2xl text-white">
              S
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">Shivansh Rai</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                100% Free Plan
              </span>
            </div>
            <p className="text-xs text-slate-400">GLBITM B.Tech CSE (DS) • AlgoCraft Lead Architect</p>
            <div className="pt-1">
              <a
                href="mailto:shivanshrai282@gmail.com"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-mono transition-colors"
                title="Send Email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>shivanshrai282@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Streak & Solved Pills */}
        <div className="flex items-center gap-4">
          <div className="p-3 px-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="text-xl font-black text-white">7 Days</div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Active Streak</div>
            </div>
          </div>

          <div className="p-3 px-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-white">{totalDeconstructed + sheetCompletedCount}</div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Problems Solved</div>
            </div>
          </div>

          <button
            onClick={() =>
              exportProfilePortfolioMarkdown({
                streak: 7,
                totalSolved: totalDeconstructed + sheetCompletedCount,
                difficultyBreakdown: { Easy: easyCount, Medium: medCount, Hard: hardCount },
                savedSolutions: solutions
              })
            }
            className="p-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 flex items-center gap-2 text-xs font-semibold text-slate-200 transition-all shadow-md cursor-pointer"
            title="Download candidate portfolio as Markdown"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export (.md)</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Difficulty Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-md">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Difficulty Breakdown</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-semibold">Easy</span>
                <span className="text-slate-400">{easyCount} solved</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, easyCount * 20)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-semibold">Medium</span>
                <span className="text-slate-400">{medCount} solved</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, medCount * 20)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-semibold">Hard</span>
                <span className="text-slate-400">{hardCount} solved</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, hardCount * 25)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sheets Summary */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-md">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Active Sheets Progress</span>
          </h3>

          <div className="space-y-3">
            {sheets.slice(0, 3).map((sheet) => {
              const secTotal = sheet.sections?.reduce((a, s) => a + (s.problems?.length || 0), 0) || 0;
              const secDone = sheet.sections?.reduce((a, s) => a + (s.problems?.filter((p) => p.completed)?.length || 0), 0) || 0;
              const pct = secTotal > 0 ? Math.round((secDone / secTotal) * 100) : 0;

              return (
                <div key={sheet._id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate">{sheet.title}</span>
                    <span className="text-emerald-400 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/sheets"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-2"
          >
            <span>Open Problem Sheets Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Interview Readiness */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Interview Preparedness</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Based on your pattern analysis, intuition mastery, and completed sheets, your FAANG algorithmic readiness is trending high.
            </p>
          </div>

          <button
            onClick={() => navigate("/interview")}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Start Mock Interview
          </button>
        </div>
      </div>

      {/* Bookmarked Solutions Archive */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-indigo-400" />
          <span>Bookmarked Deconstructions ({bookmarkedSolutions.length})</span>
        </h3>

        {bookmarkedSolutions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center space-y-3">
            <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No bookmarked breakdowns yet.</p>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <span>Explore Problem Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedSolutions.map((sol) => (
              <div
                key={sol._id}
                onClick={() => navigate(`/solution/${sol._id}`, { state: { solution: sol } })}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer space-y-3 shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {sol.problem?.platform || "LeetCode"}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      sol.problem?.difficulty === "Easy"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : sol.problem?.difficulty === "Hard"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}
                  >
                    {sol.problem?.difficulty}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {sol.problem?.name}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {sol.content?.intuition || "Detailed intuition and multi-approach breakdown."}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                  <span>{sol.content?.approaches?.length || 3} Approaches</span>
                  <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Review <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
