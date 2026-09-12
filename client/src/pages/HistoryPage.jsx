import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  History,
  Search,
  Bookmark,
  Sparkles,
  ExternalLink,
  Layers,
  Clock,
  HardDrive,
  Trash2,
  Filter
} from "lucide-react";
import axios from "axios";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  useEffect(() => {
    fetchSolutions();
  }, [search, filterDifficulty, filterPlatform, onlyBookmarks]);

  const fetchSolutions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (filterPlatform) params.platform = filterPlatform;
      if (onlyBookmarks) params.bookmarked = "true";

      const res = await axios.get("/api/solutions", { params });
      if (res.data?.solutions) {
        setSolutions(res.data.solutions);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Personal Problem Repository</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Problem History & Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review past breakdowns, review variable trace tables, and track your interview preparedness.
          </p>
        </div>

        <Link
          to="/studio"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Solve New Problem
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problem titles or topics..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Platforms</option>
            <option value="LeetCode">LeetCode</option>
            <option value="GeeksforGeeks">GeeksforGeeks</option>
            <option value="Codeforces">Codeforces</option>
          </select>

          {/* Bookmark Toggle */}
          <button
            onClick={() => setOnlyBookmarks(!onlyBookmarks)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer w-full sm:w-auto justify-center ${
              onlyBookmarks
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? "fill-amber-400" : ""}`} />
            <span>Bookmarks</span>
          </button>
        </div>
      </div>

      {/* Solutions List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading problem history...
        </div>
      ) : solutions.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Solved Problems Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || filterDifficulty || onlyBookmarks
              ? "No problem matched your active filters. Try clearing search keywords."
              : "You haven't deconstructed any problems yet. Jump into the Problem Studio to start!"}
          </p>
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Deconstruct First Problem
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solutions.map((sol) => {
            const prob = sol.problem || {};
            const optimal = sol.content?.approaches?.find((a) => a.level === "Optimal") || sol.content?.approaches?.[0];

            return (
              <div
                key={sol._id}
                onClick={() => navigate(`/solution/${sol._id}`, { state: { solution: sol } })}
                className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {prob.platform || "LeetCode"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                        prob.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : prob.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}
                    >
                      {prob.difficulty || "Medium"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(sol.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {sol.bookmarked && (
                    <Bookmark className="w-4 h-4 fill-amber-400 text-amber-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {prob.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {sol.content?.intuition || "Algorithmic deconstruction and optimal analysis."}
                  </p>
                </div>

                {/* Bottom Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-indigo-400">
                      Time: {optimal?.timeComplexity || "O(n)"}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">
                      Space: {optimal?.spaceComplexity || "O(1)"}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-slate-400 hover:text-white">
                    <span>View breakdown</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
