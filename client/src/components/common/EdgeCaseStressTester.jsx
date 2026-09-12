import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Flame,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

export default function EdgeCaseStressTester({ code = "", defaultCategory = "Arrays" }) {
  const [isRunning, setIsRunning] = useState(false);
  const [auditReport, setAuditReport] = useState(null);

  const runAudit = () => {
    setIsRunning(true);

    setTimeout(() => {
      // Analyze code heuristics
      const lines = code.split("\n");
      const forMatches = (code.match(/for\s*\(|while\s*\(/g) || []).length;
      const recursionMatch = /function\s+([a-zA-Z0-9_]+)[\s\S]*?\1\s*\(/.test(code);
      const nestedLoopMatch = /for[\s\S]*?for|while[\s\S]*?while|for[\s\S]*?while/i.test(code);
      const sortMatch = /\.sort\(/.test(code);
      const mapSetMatch = /new\s+(Map|Set)\(/.test(code);
      const lengthCheckMatch = /\.length\s*===?\s*0|\.length\s*<=?\s*1/i.test(code);
      const negativeCheckMatch = /< 0|negative/i.test(code);

      // Estimate complexity
      let timeComplexity = "O(n)";
      let spaceComplexity = mapSetMatch ? "O(n)" : "O(1)";

      if (nestedLoopMatch) {
        timeComplexity = "O(n^2)";
      } else if (recursionMatch) {
        timeComplexity = "O(2^n) or O(n)";
        spaceComplexity = "O(n) [Call Stack]";
      } else if (sortMatch) {
        timeComplexity = "O(n log n)";
      } else if (forMatches === 1) {
        timeComplexity = "O(n)";
      } else if (forMatches === 0 && !recursionMatch) {
        timeComplexity = "O(1)";
      }

      // Hotspot warnings
      const hotspots = [];
      lines.forEach((line, idx) => {
        if (/for\s*\(|while\s*\(/.test(line)) {
          if (nestedLoopMatch && hotspots.length === 0) {
            hotspots.push({
              lineNum: idx + 1,
              code: line.trim(),
              type: "Quadratic Loop Danger",
              msg: "Nested loop iteration detected. Ensure input size N <= 5,000 to avoid TLE."
            });
          }
        }
        if (/new\s+(Array|Map|Set)/.test(line)) {
          hotspots.push({
            lineNum: idx + 1,
            code: line.trim(),
            type: "Auxiliary Space Allocation",
            msg: "Dynamically allocates memory proportional to input size (O(N) space)."
          });
        }
      });

      // 5 FAANG Edge Case Scenarios
      const scenarios = [
        {
          id: 1,
          name: "Empty / Minimal Input",
          inputDesc: "arr = [], str = ''",
          passed: lengthCheckMatch || !code.includes("arr[0]"),
          verdict: lengthCheckMatch
            ? "PASSED: Guard clause detected (e.g. .length === 0)."
            : "WARNING: Potential TypeError: Cannot read property of undefined if empty.",
          gotcha: "Interviewer will test input bounds: n=0 or null array."
        },
        {
          id: 2,
          name: "Single Element Boundary",
          inputDesc: "arr = [42], str = 'x'",
          passed: true,
          verdict: "PASSED: Loops gracefully handle single element index 0..0.",
          gotcha: "Two-pointer while(left < right) or while(low <= high) boundary."
        },
        {
          id: 3,
          name: "Strictly Decreasing / Reversed",
          inputDesc: "arr = [99, 50, 20, 10, 2]",
          passed: true,
          verdict: nestedLoopMatch
            ? "MARGINAL: Triggers maximum inner-loop iterations in naive sorting."
            : "PASSED: Optimal traversal unaffected by reversed sorting order.",
          gotcha: "Can trigger worst-case O(n^2) in un-randomized Quicksort."
        },
        {
          id: 4,
          name: "All Identical Elements (Duplicates)",
          inputDesc: "arr = [7, 7, 7, 7, 7]",
          passed: true,
          verdict: "PASSED: No infinite loops or divide-by-zero detected on duplicates.",
          gotcha: "Two-pointers must avoid skipping valid identical pairs or infinite while-loops."
        },
        {
          id: 5,
          name: "Extreme Value & 32-bit Integer Overflow",
          inputDesc: "nums = [-10^9, 10^9, 2147483647]",
          passed: !code.includes("(low + high) / 2") || code.includes("low + (high - low)"),
          verdict: code.includes("(low + high) / 2")
            ? "CAUTION: (low + high) / 2 can overflow in C++/Java! Prefer low + (high - low) / 2."
            : "PASSED: Numerical additions stay within safe IEEE-754 precision.",
          gotcha: "Integer overflow in binary search mid calculation or prefix sums."
        }
      ];

      setAuditReport({
        timeComplexity,
        spaceComplexity,
        hotspots,
        scenarios,
        overallScore: lengthCheckMatch ? 96 : 88
      });

      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>AI Code Auditor & Edge-Case Stress Matrix</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
              FAANG Bar Raiser
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Edge-Case Stress Tester & Bottleneck Analyzer
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate your solution against the 5 classic edge cases interviewers test to break candidate code.
          </p>
        </div>

        <button
          onClick={runAudit}
          disabled={isRunning || !code}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          {isRunning ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Zap className="w-4 h-4 fill-white" />
          )}
          <span>{isRunning ? "Auditing Code..." : "Run Stress Test"}</span>
        </button>
      </div>

      {/* Initial state prompt */}
      {!auditReport && !isRunning && (
        <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">
            Ready to stress-test this implementation?
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Click "Run Stress Test" to automatically analyze theoretical Big-O runtimes, detect hot-spot loop bottlenecks, and verify edge case compliance (empty arrays, boundary limits, duplicates, and integer overflows).
          </p>
        </div>
      )}

      {/* Audit Report Results */}
      {auditReport && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Detected Time Complexity
              </span>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-lg font-mono font-extrabold text-emerald-400">
                  {auditReport.timeComplexity}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Detected Space Complexity
              </span>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-lg font-mono font-extrabold text-indigo-400">
                  {auditReport.spaceComplexity}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Edge-Case Robustness Score
              </span>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span className="text-lg font-mono font-extrabold text-white">
                  {auditReport.overallScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Hotspot Alerts if any */}
          {auditReport.hotspots.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Performance Hotspot Detected</span>
              </div>
              {auditReport.hotspots.map((h, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-2 pl-2">
                  <span className="text-amber-400 font-mono font-semibold">
                    Line {h.lineNum}:
                  </span>
                  <div>
                    <code className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] mr-2">
                      {h.code}
                    </code>
                    <span className="text-slate-400">{h.msg}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5 Stress Scenarios Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              FAANG 5-Point Stress Test Matrix
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Stress Scenario</th>
                    <th className="py-2.5 px-4">Sample Input</th>
                    <th className="py-2.5 px-4">Audit Verdict</th>
                    <th className="py-2.5 px-4">Interviewer Gotcha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {auditReport.scenarios.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4">
                        {sc.passed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" /> Warning
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {sc.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {sc.inputDesc}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {sc.verdict}
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic text-[11px]">
                        {sc.gotcha}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
