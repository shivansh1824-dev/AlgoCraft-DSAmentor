import mongoose from "mongoose";

const problemItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  platform: { type: String, default: "LeetCode" },
  url: { type: String, default: "" },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
  completed: { type: Boolean, default: false },
  notes: { type: String, default: "" }
});

const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  problems: [problemItemSchema]
});

const sheetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  isTemplate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  sections: [sectionSchema]
});

export const Sheet = mongoose.models.Sheet || mongoose.model("Sheet", sheetSchema);

// In-memory resilient store for offline / local-dev mode
export const inMemorySheets = new Map();

// Seed initial starter template in memory
const seedStarterSheet = () => {
  const starterId = "sheet_starter_striver";
  inMemorySheets.set(starterId, {
    _id: starterId,
    title: "Striver's SDE Core Sheet",
    description: "Hand-picked high-impact problems frequently asked by Google, Amazon, Microsoft & Uber.",
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: "sec_arrays",
        title: "Arrays & Hashing",
        description: "Master two-pointer passes, hash maps, and in-place transformations.",
        problems: [
          { id: "p1", name: "Set Matrix Zeroes", platform: "LeetCode", difficulty: "Medium", completed: false, url: "https://leetcode.com/problems/set-matrix-zeroes/" },
          { id: "p2", name: "Pascal's Triangle", platform: "LeetCode", difficulty: "Easy", completed: true, url: "https://leetcode.com/problems/pascals-triangle/" },
          { id: "p3", name: "Next Permutation", platform: "LeetCode", difficulty: "Medium", completed: false, url: "https://leetcode.com/problems/next-permutation/" },
          { id: "p4", name: "Kadane's Algorithm (Max Subarray)", platform: "LeetCode", difficulty: "Medium", completed: true, url: "https://leetcode.com/problems/maximum-subarray/" },
          { id: "p5", name: "Sort Colors (0s, 1s, 2s)", platform: "LeetCode", difficulty: "Medium", completed: false, url: "https://leetcode.com/problems/sort-colors/" }
        ]
      },
      {
        id: "sec_two_pointers",
        title: "Two Pointers & Sliding Window",
        description: "Substrings, running windows, and sorted array optimizations.",
        problems: [
          { id: "p6", name: "3Sum", platform: "LeetCode", difficulty: "Medium", completed: false, url: "https://leetcode.com/problems/3sum/" },
          { id: "p7", name: "Trapping Rain Water", platform: "LeetCode", difficulty: "Hard", completed: false, url: "https://leetcode.com/problems/trapping-rain-water/" },
          { id: "p8", name: "Longest Substring Without Repeating Characters", platform: "LeetCode", difficulty: "Medium", completed: true, url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
          { id: "p9", name: "Minimum Window Substring", platform: "LeetCode", difficulty: "Hard", completed: false, url: "https://leetcode.com/problems/minimum-window-substring/" }
        ]
      },
      {
        id: "sec_trees",
        title: "Binary Trees & BST",
        description: "Traversals, depth calculations, views, and LCA.",
        problems: [
          { id: "p10", name: "Maximum Depth of Binary Tree", platform: "LeetCode", difficulty: "Easy", completed: true, url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
          { id: "p11", name: "Lowest Common Ancestor in BST", platform: "LeetCode", difficulty: "Medium", completed: false, url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
          { id: "p12", name: "Binary Tree Level Order Traversal", platform: "LeetCode", difficulty: "Medium", completed: false, url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" }
        ]
      },
      {
        id: "sec_dp",
        title: "Dynamic Programming",
        description: "Subproblems, recurrence relations, and memoization.",
        problems: [
          { id: "p13", name: "Climbing Stairs", platform: "LeetCode", difficulty: "Easy", completed: true, url: "https://leetcode.com/problems/climbing-stairs/" },
          { id: "p14", name: "Coin Change", platform: "LeetCode", difficulty: "Medium", completed: false, url: "https://leetcode.com/problems/coin-change/" },
          { id: "p15", name: "Longest Increasing Subsequence", platform: "LeetCode", difficulty: "Medium", completed: false, url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
          { id: "p16", name: "Edit Distance", platform: "LeetCode", difficulty: "Hard", completed: false, url: "https://leetcode.com/problems/edit-distance/" }
        ]
      }
    ]
  });
};

seedStarterSheet();
