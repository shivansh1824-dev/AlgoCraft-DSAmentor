import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => "user_" + Math.random().toString(36).substring(2, 9),
    },
    displayName: {
      type: String,
      default: "AlgoCrafter",
    },
    email: {
      type: String,
      default: "",
    },
    problemsSolved: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 1,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    solvedTopics: {
      type: Map,
      of: Number,
      default: {},
    },
    bookmarks: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
