import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Sparkles,
  RotateCw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Filter,
  Layers,
  Code2,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
  Zap,
  Repeat
} from "lucide-react";

export const DSA_PATTERNS = [
  {
    id: "two-pointers-opposite",
    title: "Two Pointers (Opposite Ends)",
    category: "Arrays & Strings",
    difficulty: "Foundational",
    triggers: [
      "Input array is sorted (or can be sorted).",
      "Looking for a pair or triplet that meets a target sum.",
      "Reversing or palindrome verification without extra memory."
    ],
    mentalModel: "Start one pointer at index 0 and another at index N - 1. Move them inward based on comparison against target value to prune entire search spaces in O(1).",
    timeComplexity: "O(N) time",
    spaceComplexity: "O(1) auxiliary space",
    template: `int left = 0, right = n - 1;
while (left < right) {
    int currentSum = arr[left] + arr[right];
    if (currentSum == target) {
        return {left, right};
    } else if (currentSum < target) {
        left++; // need a larger sum
    } else {
        right--; // need a smaller sum
    }
}`,
    classicProblems: [
      { name: "Two Sum II (Sorted)", platform: "LeetCode", difficulty: "Medium" },
      { name: "3Sum", platform: "LeetCode", difficulty: "Medium" },
      { name: "Container With Most Water", platform: "LeetCode", difficulty: "Medium" }
    ]
  },
  {
    id: "sliding-window-dynamic",
    title: "Sliding Window (Dynamic Size)",
    category: "Arrays & Strings",
    difficulty: "Intermediate",
    triggers: [
      "Problem involves a contiguous subarray or substring.",
      "Requires finding the minimum / maximum window satisfying a constraint.",
      "Running sum, frequency count, or character uniqueness."
    ],
    mentalModel: "Expand the right boundary 'right++' to satisfy conditions. Once condition is met (or violated), contract the left boundary 'left++' while updating optimal answer.",
    timeComplexity: "O(N) time (each element enters and exits window once)",
    spaceComplexity: "O(K) auxiliary space (hash map / frequency array)",
    template: `int left = 0, minLen = INT_MAX;
unordered_map<char, int> window;

for (int right = 0; right < s.length(); right++) {
    window[s[right]]++; // expand window
    
    while (/* condition satisfied/violated */) {
        minLen = min(minLen, right - left + 1);
        window[s[left]]--; // contract window
        left++;
    }
}`,
    classicProblems: [
      { name: "Minimum Window Substring", platform: "LeetCode", difficulty: "Hard" },
      { name: "Longest Substring Without Repeating Characters", platform: "LeetCode", difficulty: "Medium" },
      { name: "Max Consecutive Ones III", platform: "LeetCode", difficulty: "Medium" }
    ]
  },
  {
    id: "monotonic-stack",
    title: "Monotonic Stack",
    category: "Stack & Queues",
    difficulty: "Intermediate",
    triggers: [
      "Need the 'next greater' or 'previous smaller' element for every index.",
      "Problems involving histograms, water trapping, or visible buildings.",
      "Finding spans or subarray ranges where element is the minimum/maximum."
    ],
    mentalModel: "Maintain elements in strictly increasing or decreasing order. When an incoming element violates monotonicity, pop top elements and process their bounded area or answer.",
    timeComplexity: "O(N) time (each element is pushed and popped at most once)",
    spaceComplexity: "O(N) auxiliary space",
    template: `stack<int> st; // stores indices
vector<int> result(n, -1);

for (int i = 0; i < n; i++) {
    while (!st.empty() && arr[st.top()] < arr[i]) {
        int poppedIdx = st.top();
        st.pop();
        result[poppedIdx] = arr[i]; // arr[i] is next greater
    }
    st.push(i);
}`,
    classicProblems: [
      { name: "Daily Temperatures", platform: "LeetCode", difficulty: "Medium" },
      { name: "Largest Rectangle in Histogram", platform: "LeetCode", difficulty: "Hard" },
      { name: "Trapping Rain Water", platform: "LeetCode", difficulty: "Hard" }
    ]
  },
  {
    id: "kadanes-algorithm",
    title: "Kadane's Algorithm",
    category: "Dynamic Programming",
    difficulty: "Foundational",
    triggers: [
      "Find the maximum (or minimum) sum contiguous subarray.",
      "Negative numbers exist in the array (if all positive, greedy prefix sum works).",
      "1D optimization without creating an explicit DP array."
    ],
    mentalModel: "At each element, decide: start a fresh subarray with arr[i], or extend the existing running sum. Keep track of overall global maximum.",
    timeComplexity: "O(N) time",
    spaceComplexity: "O(1) auxiliary space",
    template: `int maxSoFar = arr[0], currentMax = arr[0];

for (int i = 1; i < n; i++) {
    currentMax = max(arr[i], currentMax + arr[i]);
    maxSoFar = max(maxSoFar, currentMax);
}
return maxSoFar;`,
    classicProblems: [
      { name: "Maximum Subarray", platform: "LeetCode", difficulty: "Medium" },
      { name: "Maximum Absolute Sum of Any Subarray", platform: "LeetCode", difficulty: "Medium" },
      { name: "Maximum Product Subarray", platform: "LeetCode", difficulty: "Medium" }
    ]
  },
  {
    id: "fast-slow-pointers",
    title: "Fast & Slow Pointers (Floyd's Cycle)",
    category: "Linked List",
    difficulty: "Foundational",
    triggers: [
      "Detecting cycles in a linked list or finite state graph.",
      "Finding the midpoint of a linked list in a single pass.",
      "Finding the duplicate number in an array without modifying it or using extra space."
    ],
    mentalModel: "Move 'slow' by 1 step and 'fast' by 2 steps. In a cycle, fast will inevitably lap slow from behind. To find cycle entrance, reset slow to head and advance both by 1.",
    timeComplexity: "O(N) time",
    spaceComplexity: "O(1) auxiliary space",
    template: `ListNode *slow = head, *fast = head;
while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
    if (slow == fast) {
        // Cycle detected! Reset slow to head to find entrance
        slow = head;
        while (slow != fast) {
            slow = slow->next;
            fast = fast->next;
        }
        return slow; // cycle start
    }
}
return nullptr; // no cycle`,
    classicProblems: [
      { name: "Linked List Cycle II", platform: "LeetCode", difficulty: "Medium" },
      { name: "Find the Duplicate Number", platform: "LeetCode", difficulty: "Medium" },
      { name: "Middle of the Linked List", platform: "LeetCode", difficulty: "Easy" }
    ]
  },
  {
    id: "binary-search-answer",
    title: "Binary Search on Answer Space",
    category: "Binary Search",
    difficulty: "Intermediate",
    triggers: [
      "Problem asks for 'minimum maximum' or 'maximum minimum' value.",
      "Input array is NOT sorted, but the answer range [low, high] is monotonic.",
      "A condition check function 'isValid(mid)' is easy to evaluate in O(N)."
    ],
    mentalModel: "Define search boundaries on possible answers: low = min possible answer, high = max possible answer. Mid = (low + high) / 2. If isValid(mid) is true, try to optimize further.",
    timeComplexity: "O(N · log(range)) time",
    spaceComplexity: "O(1) auxiliary space",
    template: `long long low = minVal, high = maxVal, ans = high;
while (low <= high) {
    long long mid = low + (high - low) / 2;
    if (isValid(mid)) {
        ans = mid;
        high = mid - 1; // seek smaller valid answer
    } else {
        low = mid + 1;  // must increase threshold
    }
}
return ans;`,
    classicProblems: [
      { name: "Koko Eating Bananas", platform: "LeetCode", difficulty: "Medium" },
      { name: "Capacity To Ship Packages Within D Days", platform: "LeetCode", difficulty: "Medium" },
      { name: "Split Array Largest Sum", platform: "LeetCode", difficulty: "Hard" }
    ]
  },
  {
    id: "topological-sort-kahns",
    title: "Topological Sort (Kahn's Algorithm)",
    category: "Graphs",
    difficulty: "Intermediate",
    triggers: [
      "Directed Acyclic Graph (DAG) with dependency prerequisites.",
      "Ordering tasks or build systems where some items must precede others.",
      "Detecting cycles in directed graphs."
    ],
    mentalModel: "Compute in-degree for all vertices. Push 0-in-degree nodes into a queue. Pop each node, append to topological order, and decrement in-degrees of its neighbors.",
    timeComplexity: "O(V + E) time",
    spaceComplexity: "O(V + E) space",
    template: `vector<int> inDegree(numNodes, 0);
// build inDegrees...
queue<int> q;
for (int i = 0; i < numNodes; i++) {
    if (inDegree[i] == 0) q.push(i);
}

vector<int> topoOrder;
while (!q.empty()) {
    int u = q.front(); q.pop();
    topoOrder.push_back(u);
    for (int v : adj[u]) {
        if (--inDegree[v] == 0) q.push(v);
    }
}
// if topoOrder.size() != numNodes -> cycle exists!`,
    classicProblems: [
      { name: "Course Schedule II", platform: "LeetCode", difficulty: "Medium" },
      { name: "Alien Dictionary", platform: "LeetCode", difficulty: "Hard" },
      { name: "Minimum Height Trees", platform: "LeetCode", difficulty: "Medium" }
    ]
  },
  {
    id: "knapsack-dp",
    title: "0/1 Knapsack Pattern",
    category: "Dynamic Programming",
    difficulty: "Intermediate",
    triggers: [
      "Given items with weight/cost and value/target.",
      "Each item can be chosen at most once (0 or 1).",
      "Target sum or partition into subsets."
    ],
    mentalModel: "dp[w] stores max value achievable with capacity w. Loop items on the outer loop and capacity backwards from W down to weight[i] to prevent reusing the same item.",
    timeComplexity: "O(N · W) time",
    spaceComplexity: "O(W) auxiliary space (1D array optimized)",
    template: `vector<int> dp(target + 1, 0);

for (int i = 0; i < n; i++) {
    // iterate backwards for 0/1 knapsack
    for (int w = target; w >= weight[i]; w--) {
        dp[w] = max(dp[w], dp[w - weight[i]] + value[i]);
    }
}`,
    classicProblems: [
      { name: "Partition Equal Subset Sum", platform: "LeetCode", difficulty: "Medium" },
      { name: "Target Sum", platform: "LeetCode", difficulty: "Medium" },
      { name: "Ones and Zeroes", platform: "LeetCode", difficulty: "Medium" }
    ]
  },
  {
    id: "backtracking-template",
    title: "Backtracking (Choose, Explore, Unchoose)",
    category: "Recursion & Trees",
    difficulty: "Intermediate",
    triggers: [
      "Find all combinations, permutations, or valid board configurations.",
      "Decision tree where you must explore all branches and revert state.",
      "Input size N is typically small (N ≤ 15)."
    ],
    mentalModel: "At current depth: make a choice, push to candidate path, recurse to next state, then immediately pop/unchoose to restore state for parallel branches.",
    timeComplexity: "O(N! · N) or O(2ᴺ · N) time",
    spaceComplexity: "O(N) recursion stack depth",
    template: `void backtrack(int startIdx, vector<int>& currentPath, vector<vector<int>>& result) {
    if (/* goal reached */) {
        result.push_back(currentPath);
        return;
    }

    for (int i = startIdx; i < nums.size(); i++) {
        // Choose
        currentPath.push_back(nums[i]);
        // Explore
        backtrack(i + 1, currentPath, result);
        // Unchoose (Backtrack)
        currentPath.pop_back();
    }
}`,
    classicProblems: [
      { name: "Subsets", platform: "LeetCode", difficulty: "Medium" },
      { name: "Permutations", platform: "LeetCode", difficulty: "Medium" },
      { name: "N-Queens", platform: "LeetCode", difficulty: "Hard" }
    ]
  },
  {
    id: "trie-prefix-tree",
    title: "Trie (Prefix Tree)",
    category: "Advanced DSA",
    difficulty: "Intermediate",
    triggers: [
      "Prefix matching, auto-complete, or dictionary lookups.",
      "Comparing strings of varying lengths without quadratic comparisons.",
      "Bitwise XOR maximums (Binary Trie on 32-bit integers)."
    ],
    mentalModel: "Tree where each node represents a character. Edges correspond to character transitions. Avoid duplicate storage of common prefixes.",
    timeComplexity: "O(L) time per insert/search where L is string length",
    spaceComplexity: "O(N · L · 26) space",
    template: `struct TrieNode {
    TrieNode* children[26] = {nullptr};
    bool isEndOfWord = false;
};

void insert(TrieNode* root, string word) {
    TrieNode* node = root;
    for (char c : word) {
        int idx = c - 'a';
        if (!node->children[idx]) node->children[idx] = new TrieNode();
        node = node->children[idx];
    }
    node->isEndOfWord = true;
}`,
    classicProblems: [
      { name: "Implement Trie (Prefix Tree)", platform: "LeetCode", difficulty: "Medium" },
      { name: "Word Search II", platform: "LeetCode", difficulty: "Hard" },
      { name: "Maximum XOR of Two Numbers in an Array", platform: "LeetCode", difficulty: "Medium" }
    ]
  },
  {
    id: "union-find-dsu",
    title: "Union-Find / Disjoint Set Union (DSU)",
    category: "Graphs",
    difficulty: "Advanced",
    triggers: [
      "Dynamic connectivity: are elements A and B in the same component?",
      "Kruskal's Minimum Spanning Tree (MST).",
      "Detecting cycles in an undirected graph."
    ],
    mentalModel: "Each element points to its parent. Find(x) uses Path Compression to flatten tree. Union(x, y) attaches smaller tree under root of larger tree (Union by Rank).",
    timeComplexity: "O(α(N)) ≈ O(1) amortized time (Inverse Ackermann)",
    spaceComplexity: "O(N) parent and rank arrays",
    template: `struct DSU {
    vector<int> parent, rank;
    DSU(int n) : parent(n), rank(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]); // path compression
        return parent[x];
    }
    bool unite(int x, int y) {
        int rootX = find(x), rootY = find(y);
        if (rootX == rootY) return false; // already connected (cycle)
        if (rank[rootX] < rank[rootY]) swap(rootX, rootY);
        parent[rootY] = rootX;
        if (rank[rootX] == rank[rootY]) rank[rootX]++;
        return true;
    }
};`,
    classicProblems: [
      { name: "Number of Connected Components in Graph", platform: "LeetCode", difficulty: "Medium" },
      { name: "Redundant Connection", platform: "LeetCode", difficulty: "Medium" },
      { name: "Accounts Merge", platform: "LeetCode", difficulty: "Medium" }
    ]
  },
  {
    id: "bfs-shortest-path",
    title: "Breadth-First Search (Level Order & Shortest Path)",
    category: "Graphs",
    difficulty: "Foundational",
    triggers: [
      "Shortest path in an unweighted graph or 2D grid.",
      "Level-by-level traversal of trees or multi-source propagation.",
      "Finding minimum number of steps/mutations to reach a target state."
    ],
    mentalModel: "Use a FIFO queue. Push initial state at step 0. Pop layer by layer, explore all valid neighbors, mark visited immediately to prevent duplicates.",
    timeComplexity: "O(V + E) time",
    spaceComplexity: "O(V) queue and visited set",
    template: `queue<pair<int, int>> q; // {node, distance}
vector<bool> visited(n, false);

q.push({startNode, 0});
visited[startNode] = true;

while (!q.empty()) {
    auto [curr, dist] = q.front(); q.pop();
    if (curr == target) return dist;

    for (int next : adj[curr]) {
        if (!visited[next]) {
            visited[next] = true;
            q.push({next, dist + 1});
        }
    }
}`,
    classicProblems: [
      { name: "Rotting Oranges", platform: "LeetCode", difficulty: "Medium" },
      { name: "Word Ladder", platform: "LeetCode", difficulty: "Hard" },
      { name: "01 Matrix", platform: "LeetCode", difficulty: "Medium" }
    ]
  }
];

export default function FlashcardsPage() {
  const navigate = useNavigate();

  // Active flashcard index
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Spaced repetition ratings: { [patternId]: "Again" | "Hard" | "Good" | "Easy" }
  const [masteryData, setMasteryData] = useState(() => {
    try {
      const saved = localStorage.getItem("algocraft_flashcards_mastery");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const categories = ["All", "Arrays & Strings", "Stack & Queues", "Linked List", "Binary Search", "Dynamic Programming", "Graphs", "Recursion & Trees", "Advanced DSA"];

  const filteredPatterns = selectedCategory === "All"
    ? DSA_PATTERNS
    : DSA_PATTERNS.filter((p) => p.category === selectedCategory);

  const activePattern = filteredPatterns[currentIdx] || filteredPatterns[0];

  // Save mastery rating
  const handleRate = (rating) => {
    if (!activePattern) return;
    const updated = {
      ...masteryData,
      [activePattern.id]: rating
    };
    setMasteryData(updated);
    localStorage.setItem("algocraft_flashcards_mastery", JSON.stringify(updated));

    // Auto advance to next card
    setIsFlipped(false);
    if (currentIdx < filteredPatterns.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIdx((prev) => (prev < filteredPatterns.length - 1 ? prev + 1 : 0));
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIdx((prev) => (prev > 0 ? prev - 1 : filteredPatterns.length - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredPatterns.length]);

  // Overall Mastery stats
  const totalMastered = Object.values(masteryData).filter((r) => r === "Good" || r === "Easy").length;
  const masteryPercent = Math.round((totalMastered / DSA_PATTERNS.length) * 100);

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <Brain className="w-3.5 h-3.5" />
            <span>Spaced Repetition & Pattern Mastery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            DSA Pattern Flashcards
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Internalize the 12 fundamental interview patterns, mental models, and templates. Space key: flip card • Arrow keys: navigate.
          </p>
        </div>

        {/* Mastery Progress Badge */}
        <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 p-3 px-5 rounded-2xl shadow-lg">
          <div className="text-right">
            <div className="text-lg font-black text-white">
              {totalMastered} / {DSA_PATTERNS.length}
            </div>
            <div className="text-[10px] uppercase font-bold text-emerald-400">
              {masteryPercent}% Mastered
            </div>
          </div>

          <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center font-bold text-xs text-purple-400 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-500"
                strokeDasharray={`${masteryPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-white">{masteryPercent}%</span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentIdx(0);
              setIsFlipped(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Flashcard Area */}
      {activePattern && (
        <div className="space-y-6">
          {/* Card Container with Flip Animation */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[440px] rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-[#0B0F17] to-slate-900 border border-slate-800 hover:border-purple-500/40 shadow-2xl transition-all cursor-pointer relative flex flex-col justify-between group overflow-hidden select-none"
          >
            {/* Top Card Info Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {activePattern.category}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {activePattern.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono font-bold text-white">
                  {currentIdx + 1} / {filteredPatterns.length}
                </span>
                <span className="text-[11px] text-purple-400 group-hover:text-purple-300 flex items-center gap-1 font-semibold">
                  <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Click / Space to {isFlipped ? "see Triggers" : "flip to Template"}</span>
                </span>
              </div>
            </div>

            {/* FRONT FACE: Pattern & Triggers */}
            {!isFlipped ? (
              <div className="my-auto space-y-6 animate-in fade-in">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {activePattern.title}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                    {activePattern.mentalModel}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>When to Suspect This Pattern? (Interview Clues)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activePattern.triggers.map((trig, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span>{trig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* BACK FACE: Template & Code */
              <div className="my-auto space-y-5 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-emerald-400" />
                    <span>{activePattern.title} — Blueprint</span>
                  </h2>

                  {/* Complexity Pills */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {activePattern.timeComplexity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {activePattern.spaceComplexity}
                    </span>
                  </div>
                </div>

                {/* Template Code Block */}
                <div className="rounded-xl border border-slate-800 bg-[#070A10] p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto leading-relaxed max-h-56">
                  <pre>
                    <code>{activePattern.template}</code>
                  </pre>
                </div>

                {/* Classic Problems */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">
                    Classic FAANG Benchmark Problems:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePattern.classicProblems.map((prob, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/studio", { state: { initialProblem: prob.name, difficulty: prob.difficulty } });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700/80 text-xs transition-all cursor-pointer shadow-sm"
                      >
                        <span>{prob.name}</span>
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Card Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span>Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    masteryData[activePattern.id] === "Easy"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : masteryData[activePattern.id] === "Good"
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                      : masteryData[activePattern.id] === "Hard"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : masteryData[activePattern.id] === "Again"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {masteryData[activePattern.id] || "New"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/studio", { state: { initialProblem: activePattern.classicProblems[0].name } });
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Solve Classic Problem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Spaced Repetition Recall Buttons */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Repeat className="w-4 h-4 text-indigo-400" />
              <span>How well do you recall this pattern?</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleRate("Again")}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                title="Review again immediately"
              >
                Again
              </button>

              <button
                onClick={() => handleRate("Hard")}
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                title="Review in 1 day"
              >
                Hard
              </button>

              <button
                onClick={() => handleRate("Good")}
                className="px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer"
                title="Review in 3 days"
              >
                Good
              </button>

              <button
                onClick={() => handleRate("Easy")}
                className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                title="Mastered! Review in 7 days"
              >
                Easy
              </button>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIdx((prev) => (prev > 0 ? prev - 1 : filteredPatterns.length - 1));
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Pattern</span>
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIdx((prev) => (prev < filteredPatterns.length - 1 ? prev + 1 : 0));
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Next Pattern</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
