import React, { useState } from "react";
import { Copy, Check, FileCode2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CodeViewer({ code, language = "C++", title, onSendToPlayground }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayground = () => {
    if (onSendToPlayground) {
      onSendToPlayground(code, language);
    } else {
      navigate("/playground", { state: { code, language } });
    }
  };

  const lines = (code || "").split("\n");

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0B101B] shadow-xl">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          {title && <span className="font-semibold text-slate-300 mr-2">{title}</span>}
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-[11px] border border-indigo-500/20">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayground}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Open in Code Editor"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-medium">Open in Code Editor</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed max-h-[500px]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 group">
                <td className="w-10 pr-4 select-none text-right text-slate-600 group-hover:text-slate-500 text-xs">
                  {idx + 1}
                </td>
                <td className="text-slate-200 whitespace-pre">
                  {line || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
