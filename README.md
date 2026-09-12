# AlgoCraft — AI-Powered DSA Mentor & Technical Interview Studio 🚀

![AlgoCraft Platform](client/public/images/hero_algo_bg.jpg)

**AlgoCraft** is a 100% free, full-stack AI-powered Data Structures & Algorithms mentor and technical interview preparation studio built for placement aspirants and competitive programmers. It features zero credit tokens, zero paywalls, and deep pedagogical tooling designed around algorithmic intuition.

---

## ✨ Key Features & Architecture

### 1. 🔮 Problem Studio (`/studio`)
- **Auto-Import from URLs**: Live URL metadata extractor for LeetCode and GeeksforGeeks problems.
- **Triple-Approach Deconstruction**: Automatically evolves problem solutions from quadratic **Brute Force**, to log-linear **Better**, to peak **Optimal $O(N)$** implementations.
- **Tailored Depth Controls**: Standard or Deep-Dive generation with custom multi-language support (C++, Python, Java, JavaScript).

### 2. ⚡ Solution Masterclass (`/solution/:id`)
- **Interactive Dry-Run Debugger**: Step-by-step execution trace player with active pointer spotlighting and variable state tables.
- **Voice-Enabled Speech Mentor**: Integrated browser speech synthesis for hands-free audio walkthroughs of algorithmic intuition.
- **Visual Big-O Complexity Graph & TLE Simulator**: Input size $N$ slider ($10$ to $10^6$), live operation counter, judge timeout threshold ($10^8$ ops), and FAANG constraints rule of thumb.
- **AI Edge-Case & Complexity Stress Matrix**: Automatically checks code against 5 classic interviewer breaking scenarios (empty inputs, single elements, reversed arrays, duplicates, and integer overflow).
- **1-Click Markdown & Clean Print Export**: Download complete study guides as GitHub-ready `.md` files or print directly to PDF.

### 3. 🎬 Interactive Algorithm Visualizer Studio (`/visualizer`)
- **5 Array & Pointer Algorithms**: Binary Search, Two Pointers (Two Sum II), Sliding Window (Max Subarray), Dutch National Flag (0, 1, 2 Sort), and Monotonic Stack (Next Greater Element).
- **Binary Tree BFS & Graph BFS Visualizers**: Animated SVG Tree and Graph canvases with glowing node illumination, queue expansion, and shortest-path highlighting.
- **Synchronized Code Spotlight**: Real-time line-by-line code execution tracking with speed controls ($0.5\times$ to $2\times$), custom inputs, and randomizers.

### 4. 🎴 DSA Pattern Flashcards & Spaced Repetition (`/flashcards`)
- **12 Canonical Patterns**: 3D animated flip cards with problem recognition cues on the front, and optimal blueprint code templates, pitfalls, and complexities on the back.
- **SM-2 Spaced Repetition Engine**: `Again (<10m)`, `Hard (+1d)`, `Good (+3d)`, `Easy (+7d)` schedule with persistent `localStorage` mastery tracking.

### 5. 📖 FAANG Pattern Recognition Cheat Sheet Matrix (`/cheatsheet`)
- High-density matrix covering all 14 algorithmic patterns with trigger keywords, asymptotic complexity limits, copyable starter blueprints, interviewer trap warnings, and direct LeetCode problem links.

### 6. 📋 Problem Sheets Tracker (`/sheets`)
- Build custom problem sheets with section-wise progress meters, 1-click solve navigation, LeetCode auto-fill, and GitHub-ready checklist export (`- [x]` / `- [ ]`).

### 7. ⏱️ FAANG Mock Technical Interview Studio (`/interview`)
- 45-minute timed phone screens simulating real interviews at **Google**, **Meta**, **Amazon**, and **Microsoft**.
- Progressive 3-tier hints ladder and AI Bar Raiser scorecard evaluating correctness, optimization, and communication.

### 8. 💻 In-Browser Code Playground (`/playground`)
- Multi-language in-browser execution runner.
- **Multi-Test Case Studio**: Manage and run multiple test cases with side-by-side **Expected vs. Actual Output** validation and runtime metrics (ms).
- **Side-by-Side Diff Viewer**: Split code comparison against AlgoCraft's optimal solution with 1-click "Adopt Code".

### 9. 🎓 Candidate Portfolio & Streak Tracker (`/profile`)
- Daily streak flame counter, solved problem difficulty distribution charts (Easy, Medium, Hard), and 1-click portfolio export.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6
- **Backend**: Node.js, Express, Mongoose / MongoDB Atlas (with in-memory fallback storage)
- **AI Intelligence**: Google Gemini API via `@google/genai` (100% free configuration)
- **Deployment**: Client on Vercel / Netlify; Server on Render / Railway / Node host

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/Algo-Craft.git
cd Algo-Craft
```

### 2. Backend Server Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri_optional
GEMINI_API_KEY=your_gemini_api_key_optional
```
*(Note: AlgoCraft automatically falls back to in-memory storage if MongoDB is not provided!)*

Start the backend:
```bash
npm run dev
# Server running at http://localhost:5000
```

### 3. Frontend Client Setup
In another terminal:
```bash
cd client
npm install
npm run dev
# Client running at http://localhost:5173
```

---

## 📦 Production Build
To create an optimized production bundle:
```bash
cd client
npm run build
```

---

## 📄 License
This project is open-source under the **MIT License**.
*AlgoCraft — Crafted for Technical Interview Mastery.*
