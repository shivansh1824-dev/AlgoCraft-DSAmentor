import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "guest_user",
      index: true,
    },
    problem: {
      name: { type: String, required: true },
      platform: { type: String, default: "LeetCode" },
      url: { type: String, default: "" },
      topic: { type: String, default: "General DSA" },
      topics: { type: [String], default: [] },
      difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
      language: { type: String, default: "C++" },
      stuckPoint: { type: String, default: "" },
    },
    settings: {
      mode: { type: String, default: "multipleApproaches" },
      depth: { type: String, default: "detailed" },
      toggles: { type: Object, default: {} },
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// In-memory fallback store for offline/standalone execution
export const inMemorySolutions = new Map();

export const Solution = mongoose.models.Solution || mongoose.model("Solution", solutionSchema);
