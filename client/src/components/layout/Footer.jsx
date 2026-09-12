import React from "react";
import { Link } from "react-router-dom";
import { Code2, Heart, Github, Sparkles, BookOpen, Terminal, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-[#070A10] text-slate-400 text-sm py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">AlgoCraft</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                100% Free
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              An intelligent, free AI DSA mentor engineered to help software developers transition from memorizing code to deriving intuitive, interview-ready optimal algorithms.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Crafted for engineers everywhere</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">No paywalls or credits</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/studio" className="hover:text-emerald-400 transition-colors">
                  Problem Studio
                </Link>
              </li>
              <li>
                <Link to="/visualizer" className="hover:text-emerald-400 transition-colors">
                  Visualizer Studio
                </Link>
              </li>
              <li>
                <Link to="/cheatsheet" className="hover:text-emerald-400 transition-colors">
                  FAANG Cheat Sheet
                </Link>
              </li>
              <li>
                <Link to="/flashcards" className="hover:text-emerald-400 transition-colors">
                  Pattern Flashcards
                </Link>
              </li>
              <li>
                <Link to="/playground" className="hover:text-emerald-400 transition-colors">
                  Code Playground
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Creator Info */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider">Contact & Creator</h4>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold text-xs">
                  S
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Shivansh Rai</span>
                  <span className="text-[10px] text-slate-400 block">Creator & Full-Stack Developer</span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <a
                  href="mailto:shivanshrai282@gmail.com"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-mono transition-colors break-all"
                  title="Send email to Shivansh Rai"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>shivanshrai282@gmail.com</span>
                </a>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Feel free to reach out for feature suggestions, algorithm additions, or collaborations!
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AlgoCraft. Built with Vite, React & Express.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <span>Completely Free & Open</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
