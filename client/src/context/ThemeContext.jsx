import React, { createContext, useContext, useState, useEffect } from "react";

export const THEMES = {
  indigo: {
    id: "indigo",
    name: "Obsidian Indigo",
    primary: "#6366f1",
    primaryLight: "#818cf8",
    badgeBg: "bg-indigo-500/10",
    badgeBorder: "border-indigo-500/30",
    badgeText: "text-indigo-400",
    glow: "shadow-indigo-500/20",
    accentGrad: "from-indigo-600 to-indigo-700",
    ring: "ring-indigo-500"
  },
  emerald: {
    id: "emerald",
    name: "Cyber Emerald",
    primary: "#10b981",
    primaryLight: "#34d399",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    accentGrad: "from-emerald-600 to-emerald-700",
    ring: "ring-emerald-500"
  },
  violet: {
    id: "violet",
    name: "Neon Violet",
    primary: "#8b5cf6",
    primaryLight: "#a78bfa",
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-400",
    glow: "shadow-purple-500/20",
    accentGrad: "from-purple-600 to-indigo-600",
    ring: "ring-purple-500"
  },
  rose: {
    id: "rose",
    name: "Crimson Flare",
    primary: "#f43f5e",
    primaryLight: "#fb7185",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-400",
    glow: "shadow-rose-500/20",
    accentGrad: "from-rose-600 to-rose-700",
    ring: "ring-rose-500"
  },
  amber: {
    id: "amber",
    name: "Amber Gold",
    primary: "#f59e0b",
    primaryLight: "#fbbf24",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-400",
    glow: "shadow-amber-500/20",
    accentGrad: "from-amber-600 to-orange-600",
    ring: "ring-amber-500"
  },
  cyan: {
    id: "cyan",
    name: "Electric Cyan",
    primary: "#06b6d4",
    primaryLight: "#22d3ee",
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-400",
    glow: "shadow-cyan-500/20",
    accentGrad: "from-cyan-600 to-blue-600",
    ring: "ring-cyan-500"
  }
};

const ThemeContext = createContext();

// Hex to rgb helper
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    return localStorage.getItem("algocraft_theme") || "indigo";
  });

  const activeTheme = THEMES[themeKey] || THEMES.indigo;

  useEffect(() => {
    localStorage.setItem("algocraft_theme", themeKey);
    const root = document.documentElement;
    root.setAttribute("data-theme", themeKey);

    // Dynamic CSS variables for instant site-wide accent retheming
    root.style.setProperty("--theme-primary", activeTheme.primary);
    root.style.setProperty("--theme-primary-light", activeTheme.primaryLight);
    root.style.setProperty("--theme-primary-rgb", hexToRgb(activeTheme.primary));
    root.style.setProperty("--theme-primary-light-rgb", hexToRgb(activeTheme.primaryLight));
    root.style.setProperty("--theme-badge-bg", `rgba(${hexToRgb(activeTheme.primary)}, 0.12)`);
    root.style.setProperty("--theme-badge-border", `rgba(${hexToRgb(activeTheme.primary)}, 0.35)`);
    root.style.setProperty("--theme-badge-text", activeTheme.primaryLight);
    root.style.setProperty("--theme-glow", `rgba(${hexToRgb(activeTheme.primary)}, 0.28)`);
  }, [themeKey, activeTheme]);

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, themeKey, setTheme: setThemeKey, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
