import React, { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Sliders
} from "lucide-react";

export default function BigOGraphCalculator({ approaches = [], problemName = "" }) {
  // Preset N values commonly found in LeetCode/Codeforces constraints
  const [nValue, setNValue] = useState(100000); // default N = 10^5
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Judge CPU limit: ~10^8 operations per second
  const TLE_THRESHOLD = 100000000;

  const presets = [
    { label: "10", value: 10 },
    { label: "100", value: 100 },
    { label: "1,000", value: 1000 },
    { label: "10⁴", value: 10000 },
    { label: "10⁵", value: 100000 },
    { label: "10⁶", value: 1000000 }
  ];

  // Helper to compute operations
  const calculateOps = (n) => {
    return {
      "O(1)": 1,
      "O(log N)": Math.max(1, Math.round(Math.log2(n))),
      "O(N)": n,
      "O(N log N)": Math.round(n * Math.log2(n)),
      "O(N²)": n > 200000 ? Infinity : n * n,
      "O(N³)": n > 5000 ? Infinity : n * n * n,
      "O(2ᴺ)": n > 40 ? Infinity : Math.pow(2, n)
    };
  };

  const ops = calculateOps(nValue);

  const formatOps = (num) => {
    if (num === Infinity || num > 1e16) return "> 10¹⁶ (Catastrophic)";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + " × 10⁹";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + " × 10⁶";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + " × 10³";
    return num.toLocaleString();
  };

  const getStatus = (num) => {
    if (num > TLE_THRESHOLD) {
      return {
        label: "TLE (Timeout)",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        icon: XCircle,
        desc: "Exceeds 1-sec judge execution limit (> 10⁸ ops)"
      };
    }
    if (num > 20000000) {
      return {
        label: "Risky (~0.8s)",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        icon: AlertTriangle,
        desc: "Close to timeout limit; could TLE on strict test suites"
      };
    }
    return {
      label: "Accepted (< 0.1s)",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: CheckCircle2,
      desc: "Blazing fast; well within 1-sec limit"
    };
  };

  // SVG Curve Chart Points for N = 10 to N = 100
  // Normalized 300x160 viewBox
  const chartWidth = 460;
  const chartHeight = 160;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Asymptotic Complexity & TLE Simulator</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Big-O Execution & Timeout Analyzer
          </h3>
          <p className="text-xs text-slate-400">
            See how your algorithms scale as input size N increases against the 1.0-second online judge threshold (~10⁸ ops).
          </p>
        </div>

        {/* Cheat Sheet Toggle */}
        <button
          onClick={() => setShowCheatSheet(!showCheatSheet)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>FAANG Constraints Rule of Thumb</span>
          {showCheatSheet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Constraints Cheat Sheet Accordion */}
      {showCheatSheet && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in text-xs">
          <span className="font-bold text-slate-200 block">
            📐 FAANG Interview Rule of Thumb (Input Size N → Target Complexity):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-amber-400 font-bold">N ≤ 12:</span>
              <span className="text-slate-300 ml-2">O(N!) or O(N² · 2ᴺ)</span>
              <div className="text-[10px] text-slate-500">Backtracking, Permutations</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-amber-400 font-bold">N ≤ 25:</span>
              <span className="text-slate-300 ml-2">O(2ᴺ)</span>
              <div className="text-[10px] text-slate-500">Subsets, Bitmask DP</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-amber-400 font-bold">N ≤ 500:</span>
              <span className="text-slate-300 ml-2">O(N³)</span>
              <div className="text-[10px] text-slate-500">Floyd-Warshall, 3D DP</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-amber-400 font-bold">N ≤ 5,000:</span>
              <span className="text-slate-300 ml-2">O(N²)</span>
              <div className="text-[10px] text-slate-500">Nested Loops, 2D Grid DP</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-emerald-400 font-bold">N ≤ 10⁵:</span>
              <span className="text-slate-300 ml-2">O(N log N)</span>
              <div className="text-[10px] text-slate-500">Sorting, Heaps, Binary Search</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-emerald-400 font-bold">N ≤ 10⁶:</span>
              <span className="text-slate-300 ml-2">O(N)</span>
              <div className="text-[10px] text-slate-500">Two Pointers, Sliding Window, Map</div>
            </div>
          </div>
        </div>
      )}

      {/* Input N Slider & Presets */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Simulated Input Size (N):
            </span>
            <span className="text-sm font-mono font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              N = {nValue.toLocaleString()}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => setNValue(p.value)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  nValue === p.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <input
          type="range"
          min="10"
          max="1000000"
          step="1000"
          value={nValue}
          onChange={(e) => setNValue(Number(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
      </div>

      {/* Approaches Comparison Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* O(1) */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400">O(1)</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Instant
            </span>
          </div>
          <div className="text-lg font-black text-white font-mono">{formatOps(ops["O(1)"])}</div>
          <p className="text-[11px] text-slate-400">Direct formula, hash lookup</p>
        </div>

        {/* O(N) Optimal */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/30 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-300">O(N) Linear</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatus(ops["O(N)"]).color}`}>
              {getStatus(ops["O(N)"]).label}
            </span>
          </div>
          <div className="text-lg font-black text-white font-mono">{formatOps(ops["O(N)"])}</div>
          <p className="text-[11px] text-slate-400">Two pointers, 1-pass hash map</p>
        </div>

        {/* O(N log N) Better */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-300">O(N log N)</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatus(ops["O(N log N)"]).color}`}>
              {getStatus(ops["O(N log N)"]).label}
            </span>
          </div>
          <div className="text-lg font-black text-white font-mono">{formatOps(ops["O(N log N)"])}</div>
          <p className="text-[11px] text-slate-400">Sorting, binary search, priority queue</p>
        </div>

        {/* O(N^2) Brute Force */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-rose-300">O(N²) Quadratic</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatus(ops["O(N²)"]).color}`}>
              {getStatus(ops["O(N²)"]).label}
            </span>
          </div>
          <div className="text-lg font-black text-white font-mono">{formatOps(ops["O(N²)"])}</div>
          <p className="text-[11px] text-slate-400">Nested loops, pairwise checks</p>
        </div>
      </div>

      {/* Visual SVG Growth Curve Comparison */}
      <div className="p-4 rounded-xl bg-[#070A10] border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Asymptotic Growth Trajectory
          </span>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> O(N)
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> O(N log N)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> O(N²)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-0.5 border-t border-dashed border-amber-400" /> 10⁸ Judge Ceiling
            </span>
          </div>
        </div>

        {/* SVG Curve Plot */}
        <div className="relative w-full h-36 flex items-center justify-center">
          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Grid Lines */}
            <line x1="40" y1="20" x2={chartWidth} y2="20" stroke="#1E293B" strokeDasharray="3,3" />
            <line x1="40" y1="70" x2={chartWidth} y2="70" stroke="#1E293B" strokeDasharray="3,3" />
            <line x1="40" y1="120" x2={chartWidth} y2="120" stroke="#1E293B" strokeDasharray="3,3" />
            <line x1="40" y1="140" x2={chartWidth} y2="140" stroke="#334155" />
            <line x1="40" y1="10" x2="40" y2="140" stroke="#334155" />

            {/* 1-Second Judge Ceiling Line (Red/Amber dashed) */}
            <line x1="40" y1="45" x2={chartWidth} y2="45" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="45" y="40" fill="#F59E0B" fontSize="9" fontFamily="monospace">
              1.0s Judge Timeout Threshold (10⁸ ops)
            </text>

            {/* O(1) Line (flat) */}
            <line x1="40" y1="138" x2={chartWidth} y2="138" stroke="#6EE7B7" strokeWidth="2" />

            {/* O(N) Line (gentle linear) */}
            <path
              d={`M 40 138 L ${chartWidth} 115`}
              stroke="#10B981"
              strokeWidth="2.5"
              fill="none"
            />

            {/* O(N log N) Line */}
            <path
              d={`M 40 138 Q ${chartWidth * 0.5} 120, ${chartWidth} 75`}
              stroke="#6366F1"
              strokeWidth="2.5"
              fill="none"
            />

            {/* O(N^2) Curve (steep explosion) */}
            <path
              d={`M 40 138 Q 120 135, 180 20`}
              stroke="#F43F5E"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Axis Labels */}
            <text x="10" y="142" fill="#64748B" fontSize="9" fontFamily="monospace">0</text>
            <text x="10" y="80" fill="#64748B" fontSize="9" fontFamily="monospace">10⁶</text>
            <text x="10" y="25" fill="#64748B" fontSize="9" fontFamily="monospace">10⁸+</text>
            <text x={chartWidth - 50} y="155" fill="#64748B" fontSize="9" fontFamily="monospace">N Scale →</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
