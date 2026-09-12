import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import StudioPage from "./pages/StudioPage.jsx";
import SolutionResultPage from "./pages/SolutionResultPage.jsx";
import PlaygroundPage from "./pages/PlaygroundPage.jsx";
import RoadmapPage from "./pages/RoadmapPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import SheetsPage from "./pages/SheetsPage.jsx";
import InterviewPage from "./pages/InterviewPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import FlashcardsPage from "./pages/FlashcardsPage.jsx";
import VisualizerPage from "./pages/VisualizerPage.jsx";
import CheatSheetPage from "./pages/CheatSheetPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative">
      {/* Global Ambient Cyber Grid Texture */}
      <div 
        className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center bg-no-repeat opacity-[0.09] mix-blend-screen"
        style={{ backgroundImage: "url('/images/cyber_grid_bg.jpg')" }}
      />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/solution/:id" element={<SolutionResultPage />} />
          <Route path="/visualizer" element={<VisualizerPage />} />
          <Route path="/cheatsheet" element={<CheatSheetPage />} />
          <Route path="/sheets" element={<SheetsPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
