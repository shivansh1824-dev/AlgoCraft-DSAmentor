import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (with resilient fallback)
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173"
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Routes
app.use("/api", apiRoutes);

// Root greeting
app.get("/", (req, res) => {
  res.json({
    name: "AlgoCraft API",
    version: "1.0.0",
    description: "AI-Powered 100% Free DSA Mentor Engine",
    endpoints: {
      health: "/api/health",
      generate: "/api/generate",
      solutions: "/api/solutions",
      chat: "/api/chat",
      roadmap: "/api/roadmap"
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 AlgoCraft server running on http://localhost:${PORT}`);
  console.log(`✨ Mode: 100% Free - Unlimited generations enabled`);
});
