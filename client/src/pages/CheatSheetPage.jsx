import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  PlayCircle,
  Brain,
  Terminal
} from "lucide-react";

const PATTERNS_MATRIX = [
  {
    id: "two_pointers",
    name: "Two Pointers",
    category: "Arrays & Strings",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    triggers: ["Sorted array", "Pair with target sum", "Reverse in-place", "Palindrome check"],
    interviewerTraps: "Pointer crossover off-by-one (while left < right vs left <= right); duplicate element handling.",
    topQuestions: [
      { name: "Two Sum II (Input Array Is Sorted)", leetcode: "167" },
      { name: "3Sum", leetcode: "15" },
      { name: "Trapping Rain Water", leetcode: "42" }
    ],
    codeBlueprint: `function twoPointers(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}`
  },
  {
    id: "sliding_window",
    name: "Sliding Window",
    category: "Arrays & Strings",
    timeComplexity: "O(n)",
    spaceComplexity: "O(k) or O(1)",
    triggers: ["Contiguous subarray/substring", "Window of size K", "Longest/shortest with condition X"],
    interviewerTraps: "Shrinking condition when window becomes invalid; forgetting to update frequency map when contracting left pointer.",
    topQuestions: [
      { name: "Maximum Average Subarray I", leetcode: "643" },
      { name: "Longest Substring Without Repeating Characters", leetcode: "3" },
      { name: "Minimum Window Substring", leetcode: "76" }
    ],
    codeBlueprint: `function slidingWindow(arr, k) {
  let left = 0, currentSum = 0, maxSum = 0;
  for (let right = 0; right < arr.length; right++) {
    currentSum += arr[right];
    if (right >= k - 1) {
      maxSum = Math.max(maxSum, currentSum);
      currentSum -= arr[left++];
    }
  }
  return maxSum;
}`
  },
  {
    id: "fast_slow_pointers",
    name: "Fast & Slow Pointers (Floyd's)",
    category: "Linked Lists",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    triggers: ["Linked list cycle", "Middle of linked list", "Find duplicate number", "Palindrome linked list"],
    interviewerTraps: "Null pointer exception when checking fast.next before fast.next.next; determining cycle start node arithmetic.",
    topQuestions: [
      { name: "Linked List Cycle", leetcode: "141" },
      { name: "Middle of the Linked List", leetcode: "876" },
      { name: "Find the Duplicate Number", leetcode: "287" }
    ],
    codeBlueprint: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`
  },
  {
    id: "monotonic_stack",
    name: "Monotonic Stack",
    category: "Stacks & Queues",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    triggers: ["Next Greater Element", "Previous Smaller Element", "Largest rectangle in histogram", "Stock span"],
    interviewerTraps: "Storing values instead of indices; using strict inequality (> vs >=) when duplicates exist.",
    topQuestions: [
      { name: "Daily Temperatures", leetcode: "739" },
      { name: "Next Greater Element I", leetcode: "496" },
      { name: "Largest Rectangle in Histogram", leetcode: "84" }
    ],
    codeBlueprint: `function monotonicStack(arr) {
  const n = arr.length;
  const res = new Array(n).fill(-1);
  const stack = []; // stores indices
  for (let i = 0; i < n; i++) {
    while (stack.length && arr[i] > arr[stack[stack.length - 1]]) {
      const prevIdx = stack.pop();
      res[prevIdx] = arr[i];
    }
    stack.push(i);
  }
  return res;
}`
  },
  {
    id: "top_k_elements",
    name: "Top K Elements (Heap)",
    category: "Heaps",
    timeComplexity: "O(n log k)",
    spaceComplexity: "O(k)",
    triggers: ["K-th largest/smallest", "Top K frequent elements", "K closest points to origin"],
    interviewerTraps: "Using a Max-Heap for K largest (requires O(n log n)) instead of Min-Heap of size K (O(n log k)).",
    topQuestions: [
      { name: "Kth Largest Element in an Array", leetcode: "215" },
      { name: "Top K Frequent Elements", leetcode: "347" },
      { name: "K Closest Points to Origin", leetcode: "973" }
    ],
    codeBlueprint: `// Maintain Min-Heap of size K for K largest elements
// If element > heap.top(), pop top and push new element
// Result top of heap is K-th largest in O(N log K) time`
  },
  {
    id: "two_heaps",
    name: "Two Heaps (Median of Stream)",
    category: "Heaps",
    timeComplexity: "O(log n) insert, O(1) find",
    spaceComplexity: "O(n)",
    triggers: ["Continuous stream of numbers", "Find median dynamically", "Maximize capital"],
    interviewerTraps: "Heap size imbalance (must maintain diff <= 1); ordering inversion (MaxHeap stores lower half, MinHeap stores upper half).",
    topQuestions: [
      { name: "Find Median from Data Stream", leetcode: "295" },
      { name: "Sliding Window Median", leetcode: "480" },
      { name: "IPO", leetcode: "502" }
    ],
    codeBlueprint: `// MaxHeap stores smaller half
// MinHeap stores larger half
// Rebalance after every insertion so sizes differ by at most 1`
  },
  {
    id: "merge_intervals",
    name: "Merge Intervals",
    category: "Arrays & Sorting",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    triggers: ["Overlapping intervals", "Meeting rooms schedule", "Insert interval", "Calendar conflict"],
    interviewerTraps: "Forgetting to sort intervals by start time first; edge case where curr.start === prev.end.",
    topQuestions: [
      { name: "Merge Intervals", leetcode: "56" },
      { name: "Insert Interval", leetcode: "57" },
      { name: "Meeting Rooms II", leetcode: "253" }
    ],
    codeBlueprint: `function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = intervals[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}`
  },
  {
    id: "modified_binary_search",
    name: "Modified Binary Search",
    category: "Binary Search",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    triggers: ["Rotated sorted array", "Find peak element", "Search 2D matrix", "Capacity to ship packages"],
    interviewerTraps: "Integer overflow on (low + high) / 2 in C++/Java; identifying which half is sorted when duplicates exist.",
    topQuestions: [
      { name: "Search in Rotated Sorted Array", leetcode: "33" },
      { name: "Find Minimum in Rotated Sorted Array", leetcode: "153" },
      { name: "Peak Index in a Mountain Array", leetcode: "852" }
    ],
    codeBlueprint: `function searchRotated(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (nums[mid] === target) return mid;
    // Left half sorted
    if (nums[low] <= nums[mid]) {
      if (nums[low] <= target && target < nums[mid]) high = mid - 1;
      else low = mid + 1;
    } else { // Right half sorted
      if (nums[mid] < target && target <= nums[high]) low = mid + 1;
      else high = mid - 1;
    }
  }
  return -1;
}`
  },
  {
    id: "tree_bfs",
    name: "Tree BFS (Level Order)",
    category: "Trees & Graphs",
    timeComplexity: "O(v + e)",
    spaceComplexity: "O(w)",
    triggers: ["Level by level traversal", "Shortest path in unweighted graph", "Zigzag traversal", "Right side view"],
    interviewerTraps: "Evaluating queue.length dynamically inside the inner loop instead of locking levelSize upfront.",
    topQuestions: [
      { name: "Binary Tree Level Order Traversal", leetcode: "102" },
      { name: "Binary Tree Right Side View", leetcode: "199" },
      { name: "Rotting Oranges", leetcode: "994" }
    ],
    codeBlueprint: `function levelOrder(root) {
  if (!root) return [];
  const res = [];
  const queue = [root];
  while (queue.length) {
    const levelSize = queue.length;
    const currentLevel = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(currentLevel);
  }
  return res;
}`
  },
  {
    id: "backtracking",
    name: "Backtracking / Subsets",
    category: "Recursion & DP",
    timeComplexity: "O(2^n) or O(n!)",
    spaceComplexity: "O(n) recursion",
    triggers: ["Find all combinations/permutations", "Subsets", "Word Search", "N-Queens"],
    interviewerTraps: "Forgetting to push a shallow copy (track.slice() or [...track]) into result array; missing backtrack undo step.",
    topQuestions: [
      { name: "Subsets", leetcode: "78" },
      { name: "Permutations", leetcode: "46" },
      { name: "Combination Sum", leetcode: "39" }
    ],
    codeBlueprint: `function subsets(nums) {
  const res = [];
  function backtrack(start, path) {
    res.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop(); // undo step
    }
  }
  backtrack(0, []);
  return res;
}`
  },
  {
    id: "dp_knapsack",
    name: "Dynamic Programming (0/1 Knapsack)",
    category: "Recursion & DP",
    timeComplexity: "O(n * w)",
    spaceComplexity: "O(w) with 1D optimization",
    triggers: ["Partition equal subset sum", "Target sum", "Maximum value with weight limit"],
    interviewerTraps: "Iterating capacity forward in 1D array causing duplicate item reuse (must iterate capacity in reverse).",
    topQuestions: [
      { name: "Partition Equal Subset Sum", leetcode: "416" },
      { name: "Target Sum", leetcode: "494" },
      { name: "Coin Change", leetcode: "322" }
    ],
    codeBlueprint: `function canPartition(nums) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2 !== 0) return false;
  const target = sum / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const num of nums) {
    for (let j = target; j >= num; j--) {
      dp[j] = dp[j] || dp[j - num];
    }
  }
  return dp[target];
}`
  },
  {
    id: "topological_sort",
    name: "Topological Sort (Kahn's)",
    category: "Trees & Graphs",
    timeComplexity: "O(v + e)",
    spaceComplexity: "O(v)",
    triggers: ["Course prerequisites", "Build order dependency", "Detect cycle in directed graph"],
    interviewerTraps: "If output length < total vertices, a cycle exists! Return empty array.",
    topQuestions: [
      { name: "Course Schedule", leetcode: "207" },
      { name: "Course Schedule II", leetcode: "210" },
      { name: "Alien Dictionary", leetcode: "269" }
    ],
    codeBlueprint: `function findOrder(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    inDegree[course]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  const order = [];
  while (queue.length) {
    const curr = queue.shift();
    order.push(curr);
    for (const next of adj[curr]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  return order.length === numCourses ? order : [];
}`
  },
  {
    id: "union_find",
    name: "Union-Find (Disjoint Set)",
    category: "Trees & Graphs",
    timeComplexity: "O(α(n)) near O(1)",
    spaceComplexity: "O(n)",
    triggers: ["Dynamic connectivity", "Graph valid tree", "Redundant connection", "Number of connected components"],
    interviewerTraps: "Missing path compression (parent[x] = find(parent[x])) or union by rank causing tree degradation to O(n).",
    topQuestions: [
      { name: "Number of Connected Components", leetcode: "323" },
      { name: "Redundant Connection", leetcode: "684" },
      { name: "Graph Valid Tree", leetcode: "261" }
    ],
    codeBlueprint: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX !== rootY) {
      this.parent[rootX] = rootY;
      return true;
    }
    return false;
  }
}`
  },
  {
    id: "trie",
    name: "Trie (Prefix Tree)",
    category: "Trees & Graphs",
    timeComplexity: "O(L) per word",
    spaceComplexity: "O(total characters)",
    triggers: ["Autocomplete / Prefix search", "Spell checker", "Maximum XOR of two numbers", "Word Search II"],
    interviewerTraps: "Forgetting to flag isEndOfWord / isWord at terminal node; character indexing when non-lowercase letters exist.",
    topQuestions: [
      { name: "Implement Trie (Prefix Tree)", leetcode: "208" },
      { name: "Design Add and Search Words", leetcode: "211" },
      { name: "Word Search II", leetcode: "212" }
    ],
    codeBlueprint: `class TrieNode {
  constructor() {
    this.children = {};
    this.isWord = false;
  }
}
class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isWord = true;
  }
  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true;
  }
}`
  }
];

export default function CheatSheetPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  const categories = ["All", "Arrays & Strings", "Stacks & Queues", "Heaps", "Trees & Graphs", "Recursion & DP", "Binary Search"];

  const filteredPatterns = PATTERNS_MATRIX.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.triggers.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.interviewerTraps.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>Interview Quick Reference Matrix</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
              14 FAANG Patterns
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            FAANG Pattern Recognition Cheat Sheet
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Spot problem signals instantly. Compare asymptotic limits, copy canonical blueprint templates, and review interviewer trap cases before your screen.
          </p>
        </div>

        {/* Quick Cross-Link Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/visualizer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-white font-semibold text-xs transition-all shadow-sm"
          >
            <PlayCircle className="w-4 h-4 text-cyan-400" />
            <span>Launch Visualizer</span>
          </Link>
          <Link
            to="/flashcards"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500/50 text-white font-semibold text-xs transition-all shadow-sm"
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span>Spaced Flashcards</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pattern, keyword, or trap..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPatterns.map((pattern) => (
          <div
            key={pattern.id}
            className="glass-card rounded-2xl border border-slate-800 p-6 space-y-5 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{pattern.name}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {pattern.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono mt-1 text-slate-400">
                    <span>
                      Time: <strong className="text-emerald-400">{pattern.timeComplexity}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Space: <strong className="text-indigo-400">{pattern.spaceComplexity}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(pattern.id, pattern.codeBlueprint)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  title="Copy canonical code blueprint"
                >
                  {copiedId === pattern.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Blueprint</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trigger Words / Problem Signals */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Trigger Words & Signals
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pattern.triggers.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Code Blueprint Snippet */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Canonical Code Blueprint
                </span>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                  <code>{pattern.codeBlueprint}</code>
                </pre>
              </div>

              {/* Interviewer Traps */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-slate-300 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Interviewer Traps & Gotchas:
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px] pl-5">
                  {pattern.interviewerTraps}
                </p>
              </div>
            </div>

            {/* Representative LeetCode Questions */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Top Practice Problems
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {pattern.topQuestions.map((q, idx) => (
                  <a
                    key={idx}
                    href={`https://leetcode.com/problems/${q.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-indigo-500/40 transition-colors"
                  >
                    <span>LC {q.leetcode}: {q.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
