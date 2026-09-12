import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Code2,
  Sparkles,
  Compass,
  History,
  Terminal,
  Flame,
  Menu,
  X,
  FileSpreadsheet,
  Timer,
  User,
  Brain,
  PlayCircle,
  BookOpen,
  Palette,
  LogIn,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import AuthModal from "../auth/AuthModal.jsx";

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, themeKey, setTheme, THEMES } = useTheme();

  const [moreToolsOpen, setMoreToolsOpen] = useState(false);

  const primaryLinks = [
    { name: "Studio", path: "/studio", icon: Sparkles },
    { name: "Visualizer", path: "/visualizer", icon: PlayCircle },
    { name: "Cheat Sheet", path: "/cheatsheet", icon: BookOpen },
    { name: "Flashcards", path: "/flashcards", icon: Brain },
    { name: "Playground", path: "/playground", icon: Terminal },
  ];

  const secondaryLinks = [
    { name: "Sheets Tracker", path: "/sheets", icon: FileSpreadsheet },
    { name: "Mock Interview", path: "/interview", icon: Timer },
    { name: "Topic Roadmap", path: "/roadmap", icon: Compass },
    { name: "History", path: "/history", icon: History },
  ];

  const allLinks = [...primaryLinks, ...secondaryLinks];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  AlgoCraft
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Free
                </span>
              </div>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {primaryLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-indigo-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* More Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreToolsOpen(!moreToolsOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {moreToolsOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-1.5 z-50 space-y-0.5">
                  {secondaryLinks.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMoreToolsOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          active
                            ? "bg-indigo-600/20 text-indigo-300"
                            : "text-slate-300 hover:text-white hover:bg-slate-900"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Action & Stats */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Palette Switcher */}
          <div className="relative">
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold shadow-inner transition-colors cursor-pointer"
              title="Change Cyber Accent Theme"
            >
              <span
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: theme.primary }}
              />
              <Palette className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850">
                  Cyber Accent Theme
                </div>
                {Object.values(THEMES).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                      themeKey === t.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-800"
                      style={{ backgroundColor: t.primary }}
                    />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Daily Streak & Profile Link */}
          <Link
            to="/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-amber-400 font-semibold shadow-inner transition-colors"
            title="View Profile & Stats"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>Streak: 7d</span>
          </Link>

          {/* User Auth or Sign In Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 cursor-pointer transition-colors shadow-inner"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                  {user.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="max-w-[90px] truncate font-medium hidden md:inline">
                  {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-850">
                    <div className="text-xs font-bold text-white truncate">{user.user_metadata?.full_name || "Developer"}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
                    {user.isDemo && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Demo Account
                      </span>
                    )}
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Quick Solve Button */}
          <Link
            to="/studio"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Solve Problem
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0B0F17] px-4 py-3 space-y-2">
          {allLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-white">{user.user_metadata?.full_name || user.email}</span>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-rose-400 hover:text-rose-300 font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-xs"
              >
                <LogIn className="w-4 h-4 text-indigo-400" />
                <span>Sign In to Cloud Account</span>
              </button>
            )}

            <Link
              to="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Solve Problem Now
            </Link>
          </div>
        </div>
      )}

      {/* Supabase Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
