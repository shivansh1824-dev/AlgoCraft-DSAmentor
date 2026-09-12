import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";
import axios from "axios";

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState([]);
  const [completedProblems, setCompletedProblems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load local storage progress
    const saved = localStorage.getItem("algocraft_completed_nodes");
    if (saved) {
      try {
        setCompletedProblems(JSON.parse(saved));
      } catch (e) {}
    }

    axios
      .get("/api/roadmap")
      .then((res) => {
        if (res.data?.roadmap) {
          setRoadmap(res.data.roadmap);
        }
      })
      .catch((err) => {
        console.error("Roadmap fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleComplete = (problemName) => {
    const updated = {
      ...completedProblems,
      [problemName]: !completedProblems[problemName]
    };
    setCompletedProblems(updated);
    localStorage.setItem("algocraft_completed_nodes", JSON.stringify(updated));
  };

  const totalProblems = roadmap.reduce((acc, cat) => acc + (cat.classicProblems?.length || 0), 0);
  const completedCount = Object.values(completedProblems).filter(Boolean).length;
  const progressPercent = totalProblems ? Math.round((completedCount / totalProblems) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Curated Interview Learning Path</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              DSA Topic Roadmap
            </h1>
            <p className="text-sm text-slate-400 max-w-xl mt-1">
              Master the highest frequency coding patterns in sequence. Click any classic problem to instantly deconstruct it with AlgoCraft.
            </p>
          </div>

          {/* Progress Card */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-4 min-w-[220px]">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white">{progressPercent}%</span>
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Mastery</div>
              <div className="text-sm font-bold text-white">
                {completedCount} / {totalProblems} Solved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Topic Tree */}
      <div className="space-y-6">
        {roadmap.map((category, idx) => {
          return (
            <div
              key={category.id}
              className="glass-panel rounded-2xl border border-slate-800/80 p-6 space-y-4 hover:border-slate-700 transition-all"
            >
              {/* Category Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{category.title}</h3>
                    <p className="text-xs text-slate-400">{category.description}</p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    category.difficulty === "Foundational"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : category.difficulty === "Intermediate"
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                      : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                  }`}
                >
                  {category.difficulty}
                </span>
              </div>

              {/* Problems Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {category.classicProblems?.map((prob) => {
                  const isDone = !!completedProblems[prob.name];
                  return (
                    <div
                      key={prob.name}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleComplete(prob.name)}
                          className="text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex flex-col">
                          <span
                            className={`text-xs font-semibold ${
                              isDone ? "line-through text-slate-500" : "text-slate-200"
                            }`}
                          >
                            {prob.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {prob.platform} • {prob.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Solve Link */}
                      <button
                        onClick={() =>
                          navigate("/studio", {
                            state: {
                              initialProblem: prob.name,
                              topic: prob.topic,
                              difficulty: prob.difficulty
                            }
                          })
                        }
                        className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Solve</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
