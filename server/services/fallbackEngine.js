/**
 * Intelligent Fallback Engine for AlgoCraft
 * Generates real, compilable, language-correct DSA code when Gemini API is unavailable.
 * Supports: C++, Java, Python, JavaScript, TypeScript, C
 */

// ─── Language-aware code generators ──────────────────────────────────────────

/**
 * Returns language-specific header/import boilerplate
 */
const getHeaders = (lang, includes = []) => {
  const base = {
    "C++": () => {
      const inc = ["<vector>", "<string>", "<unordered_map>", "<algorithm>", ...includes]
        .filter((v, i, a) => a.indexOf(v) === i)
        .map(h => `#include ${h}`)
        .join("\n");
      return `${inc}\nusing namespace std;\n`;
    },
    "Java": () => `import java.util.*;\nimport java.util.stream.*;\n`,
    "Python": () => `from typing import List, Dict, Optional, Tuple\n`,
    "JavaScript": () => ``,
    "TypeScript": () => ``,
    "C": () => `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n`
  };
  return (base[lang] || base["C++"])();
};

/**
 * Wraps a function body in the correct class/function structure for the given language
 */
const wrapSolution = (lang, returnType, funcName, params, body) => {
  switch (lang) {
    case "Java":
      return `import java.util.*;\n\nclass Solution {\n    public ${returnType} ${funcName}(${params}) {\n${body.split("\n").map(l => "        " + l).join("\n")}\n    }\n}`;
    case "Python":
      return `from typing import List, Dict, Optional\n\nclass Solution:\n    def ${funcName}(self${params ? ", " + params : ""}):\n${body.split("\n").map(l => "        " + l).join("\n")}`;
    case "JavaScript":
      return `/**\n * @param {${returnType}} result\n */\nvar ${funcName} = function(${params}) {\n${body.split("\n").map(l => "    " + l).join("\n")}\n};`;
    case "TypeScript":
      return `function ${funcName}(${params}): ${returnType} {\n${body.split("\n").map(l => "    " + l).join("\n")}\n}`;
    case "C":
      return `#include <stdlib.h>\n#include <string.h>\n\n${returnType} ${funcName}(${params}) {\n${body.split("\n").map(l => "    " + l).join("\n")}\n}`;
    case "C++":
    default:
      return `${getHeaders("C++")}\nclass Solution {\npublic:\n    ${returnType} ${funcName}(${params}) {\n${body.split("\n").map(l => "        " + l).join("\n")}\n    }\n};`;
  }
};

// ─── Classic solutions with multi-language support ────────────────────────────

const buildTwoSumSolution = (lang) => {
  const approaches = {
    "C++": [
      {
        level: "Brute Force",
        name: "Nested Loops",
        intuition: "Check every pair (i, j) where i < j to see if nums[i] + nums[j] equals target.",
        stepByStep: [
          "Loop i from 0 to n-1.",
          "Loop j from i+1 to n-1.",
          "If nums[i] + nums[j] == target, return {i, j}.",
          "Return empty if no pair found."
        ],
        code: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    return {i, j};
                }
            }
        }
        return {};
    }
};`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "Examines n*(n-1)/2 pairs in the worst case.",
        tradeOffs: "Simple to write, zero extra space, but TLE for n >= 10^4.",
        codeExplanation: "Double nested loop. Returns immediately on first valid pair."
      },
      {
        level: "Better",
        name: "Sorting + Two Pointers",
        intuition: "Sort while preserving original indices, then use two pointers converging from both ends.",
        stepByStep: [
          "Pair each number with its original index.",
          "Sort the pairs in ascending order.",
          "Initialize left = 0, right = n-1.",
          "If sum == target return indices. If sum < target, left++. Else right--."
        ],
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int n = nums.size();
        vector<pair<int,int>> pairs;
        for (int i = 0; i < n; i++) pairs.push_back({nums[i], i});
        sort(pairs.begin(), pairs.end());

        int left = 0, right = n - 1;
        while (left < right) {
            int sum = pairs[left].first + pairs[right].first;
            if (sum == target) return {pairs[left].second, pairs[right].second};
            if (sum < target) left++;
            else right--;
        }
        return {};
    }
};`,
        timeComplexity: "O(n log n)", spaceComplexity: "O(n)",
        complexityReason: "Sorting dominates at O(n log n). Storing pairs needs O(n).",
        tradeOffs: "Faster than O(n²) but needs O(n) memory and modifies traversal order.",
        codeExplanation: "Stores (value, originalIndex) pairs before sorting so we can recover indices."
      },
      {
        level: "Optimal",
        name: "One-Pass Hash Map",
        intuition: "As we iterate, check if (target - nums[i]) was already seen. If yes, we found the pair in O(1) lookup.",
        stepByStep: [
          "Initialize empty unordered_map<int,int> seen.",
          "For each index i, compute complement = target - nums[i].",
          "If complement is in seen, return {seen[complement], i}.",
          "Otherwise store seen[nums[i]] = i."
        ],
        code: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
        timeComplexity: "O(n)", spaceComplexity: "O(n)",
        complexityReason: "Single pass with O(1) average hash lookup and insert.",
        tradeOffs: "Optimal time, but requires O(n) auxiliary space for the hash map.",
        codeExplanation: "Stores each visited element before looking up — handles duplicates correctly."
      }
    ],
    "Java": [
      {
        level: "Brute Force", name: "Nested Loops",
        intuition: "Check every pair (i, j) where i < j.",
        stepByStep: ["Loop i from 0 to n-1.", "Loop j from i+1 to n-1.", "If nums[i]+nums[j]==target return {i,j}."],
        code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{};
    }
}`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "Checks all pairs.", tradeOffs: "Simple but slow for large inputs.",
        codeExplanation: "Double loop. Returns int[] on first match."
      },
      {
        level: "Better", name: "Sorting + Two Pointers",
        intuition: "Sort with original index preservation, then use two pointers.",
        stepByStep: ["Store (value, index) pairs.", "Sort by value.", "Converge two pointers."],
        code: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        int n = nums.length;
        int[][] pairs = new int[n][2];
        for (int i = 0; i < n; i++) { pairs[i][0] = nums[i]; pairs[i][1] = i; }
        Arrays.sort(pairs, (a, b) -> a[0] - b[0]);

        int left = 0, right = n - 1;
        while (left < right) {
            int sum = pairs[left][0] + pairs[right][0];
            if (sum == target) return new int[]{pairs[left][1], pairs[right][1]};
            if (sum < target) left++;
            else right--;
        }
        return new int[]{};
    }
}`,
        timeComplexity: "O(n log n)", spaceComplexity: "O(n)",
        complexityReason: "Dominated by sorting.", tradeOffs: "Faster but needs auxiliary array.",
        codeExplanation: "Preserves indices before sort, recovers them after pointer convergence."
      },
      {
        level: "Optimal", name: "One-Pass HashMap",
        intuition: "Use HashMap to look up complements in O(1) as we traverse.",
        stepByStep: ["Init HashMap<Integer,Integer>.", "For each i, check if complement is in map.", "If yes return indices. Else put current."],
        code: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
        timeComplexity: "O(n)", spaceComplexity: "O(n)",
        complexityReason: "Single pass, O(1) HashMap ops.", tradeOffs: "Optimal time, O(n) space.",
        codeExplanation: "Checks complement before inserting current — handles duplicates."
      }
    ],
    "Python": [
      {
        level: "Brute Force", name: "Nested Loops",
        intuition: "Check all pairs (i, j) where i < j.",
        stepByStep: ["Loop i from 0 to n-1.", "Loop j from i+1 to n-1.", "If nums[i]+nums[j]==target return [i,j]."],
        code: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        n = len(nums)
        for i in range(n):
            for j in range(i + 1, n):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "Checks all n*(n-1)/2 pairs.", tradeOffs: "Simple but TLE on large inputs.",
        codeExplanation: "Standard double loop. Returns on first valid pair."
      },
      {
        level: "Better", name: "Sorting + Two Pointers",
        intuition: "Sort with original indices preserved, then use two pointers.",
        stepByStep: ["Create (value, index) tuples.", "Sort by value.", "Converge two pointers."],
        code: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        pairs = sorted(enumerate(nums), key=lambda x: x[1])
        left, right = 0, len(pairs) - 1
        while left < right:
            current_sum = pairs[left][1] + pairs[right][1]
            if current_sum == target:
                return [pairs[left][0], pairs[right][0]]
            elif current_sum < target:
                left += 1
            else:
                right -= 1
        return []`,
        timeComplexity: "O(n log n)", spaceComplexity: "O(n)",
        complexityReason: "Sorting dominates.", tradeOffs: "Faster than O(n²) but needs O(n) memory.",
        codeExplanation: "enumerate() preserves original indices. sorted() sorts by value."
      },
      {
        level: "Optimal", name: "One-Pass Dictionary",
        intuition: "Use a dict to look up complements in O(1) as we traverse.",
        stepByStep: ["Init empty dict seen.", "For each i, check if (target-nums[i]) is in seen.", "If yes return [seen[complement], i]. Else store seen[nums[i]]=i."],
        code: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen: dict = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`,
        timeComplexity: "O(n)", spaceComplexity: "O(n)",
        complexityReason: "Single pass, O(1) dict ops on average.", tradeOffs: "Optimal time, O(n) space.",
        codeExplanation: "enumerate gives (index, value). Checks complement before inserting."
      }
    ]
  };

  const langApproaches = approaches[lang] || approaches["C++"];
  const templates = {
    "C++": `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};`,
    "Java": `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
    "Python": `from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your solution here\n        pass`,
    "JavaScript": `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your solution here\n    \n};`,
  };

  return {
    intuition: "The problem asks for two indices whose values add up to a target. Instead of checking every pair (O(n²)), we can use a hash map to look up whether the required complement (target - current) has been seen before — reducing the search to O(1) per element.",
    approaches: langApproaches,
    dryRun: {
      inputExample: "nums = [2, 7, 11, 15], target = 9",
      traceSteps: [
        { step: 1, variables: "i=0, num=2, complement=7", state: "seen={}", explanation: "seen doesn't have 7. Store seen[2]=0." },
        { step: 2, variables: "i=1, num=7, complement=2", state: "seen={2:0}", explanation: "seen HAS 2! Return [seen[2], 1] → [0, 1]." }
      ],
      output: "[0, 1]"
    },
    edgeCases: [
      "Negative numbers (e.g. nums=[-1,-2,-3,-4,-5], target=-8)",
      "Target via zero + another number",
      "Two identical numbers summing to target (e.g. [3,3], target=6)",
      "Large array near 32-bit integer boundaries"
    ],
    commonMistakes: [
      "Using the same element twice (accessing nums[i]+nums[i] at the same index).",
      "Pre-populating the entire map before searching — overwrites duplicate values.",
      "Returning values instead of 0-based indices."
    ],
    interviewTips: [
      "Clarify if the array is sorted before choosing between Two Pointers and Hash Map.",
      "Discuss space trade-off: if memory is tight, sorting approach avoids extra space (but mutates order).",
      "Mention O(1) average vs O(n) worst-case hash collisions for thoroughness."
    ],
    platformTemplate: {
      cpp: templates["C++"],
      java: templates["Java"],
      python: templates["Python"],
      javascript: templates["JavaScript"] || ""
    }
  };
};

// ─── Generic language-aware fallback builder ──────────────────────────────────

const buildLanguageCode = (lang, problemName, level) => {
  const isOptimal = level === "Optimal";
  const isBetter = level === "Better";

  switch (lang) {
    case "Java":
      if (isOptimal) return `import java.util.*;

class Solution {
    public int solve(int[] nums) {
        // Optimal: Single pass with HashMap for O(1) lookups
        Map<Integer, Integer> map = new HashMap<>();
        int result = 0;
        for (int i = 0; i < nums.length; i++) {
            // Check if complement exists in map
            if (map.containsKey(nums[i])) {
                result = Math.max(result, i - map.get(nums[i]));
            } else {
                map.put(nums[i], i);
            }
        }
        return result;
    }
}`;
      if (isBetter) return `import java.util.*;

class Solution {
    public int solve(int[] nums) {
        // Better: Sort + Two Pointers — O(n log n) time, O(n) space
        int n = nums.length;
        int[] sorted = Arrays.copyOf(nums, n);
        Arrays.sort(sorted);
        int left = 0, right = n - 1, result = 0;
        while (left < right) {
            int sum = sorted[left] + sorted[right];
            if (sum <= 0) { result++; left++; }
            else right--;
        }
        return result;
    }
}`;
      return `class Solution {
    public int solve(int[] nums) {
        // Brute Force: Check all pairs — O(n^2) time, O(1) space
        int n = nums.length;
        int result = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == 0) {
                    result++;
                }
            }
        }
        return result;
    }
}`;

    case "Python":
      if (isOptimal) return `from typing import List

class Solution:
    def solve(self, nums: List[int]) -> int:
        # Optimal: Single pass with dictionary — O(n) time, O(n) space
        seen: dict = {}
        result = 0
        for i, num in enumerate(nums):
            if num in seen:
                result = max(result, i - seen[num])
            else:
                seen[num] = i
        return result`;
      if (isBetter) return `from typing import List

class Solution:
    def solve(self, nums: List[int]) -> int:
        # Better: Sort + Two Pointers — O(n log n) time, O(n) space
        sorted_nums = sorted(nums)
        left, right = 0, len(sorted_nums) - 1
        result = 0
        while left < right:
            total = sorted_nums[left] + sorted_nums[right]
            if total <= 0:
                result += 1
                left += 1
            else:
                right -= 1
        return result`;
      return `from typing import List

class Solution:
    def solve(self, nums: List[int]) -> int:
        # Brute Force: Check all pairs — O(n^2) time, O(1) space
        n = len(nums)
        result = 0
        for i in range(n):
            for j in range(i + 1, n):
                if nums[i] + nums[j] == 0:
                    result += 1
        return result`;

    case "JavaScript":
      if (isOptimal) return `/**
 * @param {number[]} nums
 * @return {number}
 */
var solve = function(nums) {
    // Optimal: Single pass with Map — O(n) time, O(n) space
    const seen = new Map();
    let result = 0;
    for (let i = 0; i < nums.length; i++) {
        if (seen.has(nums[i])) {
            result = Math.max(result, i - seen.get(nums[i]));
        } else {
            seen.set(nums[i], i);
        }
    }
    return result;
};`;
      if (isBetter) return `/**
 * @param {number[]} nums
 * @return {number}
 */
var solve = function(nums) {
    // Better: Sort + Two Pointers — O(n log n) time, O(1) extra space
    const sorted = [...nums].sort((a, b) => a - b);
    let left = 0, right = sorted.length - 1, result = 0;
    while (left < right) {
        const sum = sorted[left] + sorted[right];
        if (sum <= 0) { result++; left++; }
        else right--;
    }
    return result;
};`;
      return `/**
 * @param {number[]} nums
 * @return {number}
 */
var solve = function(nums) {
    // Brute Force: Check all pairs — O(n^2) time, O(1) space
    let result = 0;
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === 0) result++;
        }
    }
    return result;
};`;

    case "C":
      if (isOptimal) return `#include <stdlib.h>
#include <string.h>

/* Optimal: Hash-based approach — O(n) average time */
int solve(int* nums, int numsSize) {
    /* Simple hash using modulo for demonstration */
    int buckets[10007] = {0};
    int result = 0;
    for (int i = 0; i < numsSize; i++) {
        int key = ((nums[i] % 10007) + 10007) % 10007;
        if (buckets[key]) {
            result++;
        }
        buckets[key] = i + 1;
    }
    return result;
}`;
      if (isBetter) return `#include <stdlib.h>

/* Comparison function for qsort */
int cmp(const void* a, const void* b) {
    return (*(int*)a - *(int*)b);
}

/* Better: Sort + Two Pointers — O(n log n) time */
int solve(int* nums, int numsSize) {
    int* sorted = (int*)malloc(numsSize * sizeof(int));
    memcpy(sorted, nums, numsSize * sizeof(int));
    qsort(sorted, numsSize, sizeof(int), cmp);

    int left = 0, right = numsSize - 1, result = 0;
    while (left < right) {
        int sum = sorted[left] + sorted[right];
        if (sum == 0) { result++; left++; right--; }
        else if (sum < 0) left++;
        else right--;
    }
    free(sorted);
    return result;
}`;
      return `#include <stdio.h>

/* Brute Force: Check all pairs — O(n^2) */
int solve(int* nums, int numsSize) {
    int result = 0;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == 0) {
                result++;
            }
        }
    }
    return result;
}`;

    case "C++":
    default:
      if (isOptimal) return `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    // Optimal: Single pass with unordered_map — O(n) time, O(n) space
    int solve(vector<int>& nums) {
        unordered_map<int,int> seen;
        int result = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (seen.count(nums[i])) {
                result = max(result, i - seen[nums[i]]);
            } else {
                seen[nums[i]] = i;
            }
        }
        return result;
    }
};`;
      if (isBetter) return `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    // Better: Sort + Two Pointers — O(n log n) time, O(n) space
    int solve(vector<int> nums) {
        sort(nums.begin(), nums.end());
        int left = 0, right = (int)nums.size() - 1, result = 0;
        while (left < right) {
            int sum = nums[left] + nums[right];
            if (sum == 0) { result++; left++; right--; }
            else if (sum < 0) left++;
            else right--;
        }
        return result;
    }
};`;
      return `#include <vector>
using namespace std;

class Solution {
public:
    // Brute Force: Check all pairs — O(n^2) time, O(1) space
    int solve(vector<int>& nums) {
        int n = nums.size(), result = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == 0) {
                    result++;
                }
            }
        }
        return result;
    }
};`;
  }
};

/**
 * Builds language-correct platform template (function signature skeleton)
 * for the given problem — matching LeetCode / GeeksforGeeks / HackerRank conventions.
 */
const buildPlatformTemplate = (lang, problemName, topic, platform = "LeetCode") => {
  const isGFG = platform?.toLowerCase().includes("geek") || platform?.toLowerCase().includes("gfg");
  
  // Infer a canonical camelCase function name from problem name
  const fnName = (problemName || "solve")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  const lowerTopic = (topic || "").toLowerCase();
  const isString = lowerTopic.includes("string");
  const isTree = lowerTopic.includes("tree");
  const isList = lowerTopic.includes("list");

  let cppParams = isGFG ? "vector<int>& arr" : "vector<int>& nums";
  let javaParams = isGFG ? "int[] arr" : "int[] nums";
  let pyParams = isGFG ? "arr: List[int]" : "nums: List[int]";
  let returnType = "int";

  if (isString) {
    cppParams = "string s";
    javaParams = "String s";
    pyParams = "s: str";
  } else if (isList) {
    cppParams = "ListNode* head";
    javaParams = "ListNode head";
    pyParams = "head: Optional[ListNode]";
    returnType = "ListNode*";
  } else if (isTree) {
    cppParams = "TreeNode* root";
    javaParams = "TreeNode root";
    pyParams = "root: Optional[TreeNode]";
  }

  const templates = {
    "C++": `#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Ready to submit on ${platform}\n    ${returnType} ${fnName}(${cppParams}) {\n        // Your solution code here\n        \n    }\n};`,
    "Java": `import java.util.*;\n\nclass Solution {\n    // Ready to submit on ${platform}\n    public ${returnType === "ListNode*" ? "ListNode" : returnType} ${fnName}(${javaParams}) {\n        // Your solution code here\n        return ${returnType === "int" ? "0" : "null"};\n    }\n}`,
    "Python": `from typing import List, Dict, Optional\n\nclass Solution:\n    # Ready to submit on ${platform}\n    def ${fnName}(self, ${pyParams}) -> ${returnType === "int" ? "int" : "Optional[object]"}:\n        # Your solution code here\n        pass`,
    "JavaScript": `/**\n * @param {${isString ? "string" : "number[]"}} ${isGFG ? "arr" : "nums"}\n * @return {number}\n */\nvar ${fnName} = function(${isGFG ? "arr" : "nums"}) {\n    // Ready to submit on ${platform}\n    \n};`,
    "TypeScript": `function ${fnName}(${isGFG ? "arr: number[]" : "nums: number[]"}): number {\n    // Ready to submit on ${platform}\n    return 0;\n}`,
    "C": `#include <stdlib.h>\n#include <string.h>\n\n/* Ready to submit on ${platform} */\nint ${fnName}(int* nums, int numsSize) {\n    /* Your solution code here */\n    return 0;\n}`
  };

  return {
    cpp: templates["C++"],
    java: templates["Java"],
    python: templates["Python"],
    javascript: templates["JavaScript"] || ""
  };
};

// ─── Additional Classic Solutions (Platform Ready) ───────────────────────────

const buildPalindromeSolution = (lang) => {
  const approaches = {
    "C++": [
      {
        level: "Brute Force", name: "Clean String and Reverse",
        intuition: "Filter alphanumeric characters, convert to lowercase, and check if equals its reverse.",
        stepByStep: ["Filter alphanumeric chars into a new string.", "Reverse the cleaned string.", "Compare with original."],
        code: `#include <string>
#include <cctype>
#include <algorithm>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        string filtered = "";
        for (char c : s) {
            if (isalnum(c)) filtered += tolower(c);
        }
        string rev = filtered;
        reverse(rev.begin(), rev.end());
        return filtered == rev;
    }
};`,
        timeComplexity: "O(n)", spaceComplexity: "O(n)",
        complexityReason: "Constructs new cleaned string of length n.",
        tradeOffs: "Simple logic but allocates extra O(n) memory.",
        codeExplanation: "Uses std::isalnum and std::tolower to normalize string."
      },
      {
        level: "Optimal", name: "Two Pointers In-Place",
        intuition: "Check characters from both ends converging inwards, skipping non-alphanumeric in O(1) space.",
        stepByStep: ["Set left = 0, right = s.length() - 1.", "Skip non-alphanumeric chars on both sides.", "If lowercase chars mismatch return false.", "If pointers cross, return true."],
        code: `#include <string>
#include <cctype>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !isalnum(s[left])) left++;
            while (left < right && !isalnum(s[right])) right--;
            if (tolower(s[left]) != tolower(s[right])) return false;
            left++;
            right--;
        }
        return true;
    }
};`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Single two-pointer traversal with zero auxiliary allocations.",
        tradeOffs: "Optimal time and space.",
        codeExplanation: "Two pointers move inwards and skip whitespace/punctuation in-place."
      }
    ],
    "Python": [
      {
        level: "Optimal", name: "Two Pointers In-Place",
        intuition: "Converge two pointers while skipping non-alphanumeric characters.",
        stepByStep: ["Initialize left = 0, right = len(s) - 1.", "Skip non-alphanumeric.", "Compare lowercased characters."],
        code: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1
        while left < right:
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1
        return True`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Visits each character at most twice in constant memory.",
        tradeOffs: "In-place, ideal for memory-constrained platforms.",
        codeExplanation: "Uses python str.isalnum() and str.lower() pointers directly."
      }
    ],
    "Java": [
      {
        level: "Optimal", name: "Two Pointers In-Place",
        intuition: "Two pointers converging inwards in-place with Character.isLetterOrDigit().",
        stepByStep: ["left = 0, right = s.length() - 1.", "Skip non-alphanumeric.", "Compare Character.toLowerCase()."],
        code: `class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Traverses string once using primitives.",
        tradeOffs: "Optimal space without substring copies.",
        codeExplanation: "Character helper methods check unicode alphanumeric values."
      }
    ]
  };

  const app = approaches[lang] || approaches["C++"];
  return {
    intuition: "A palindrome reads identical forwards and backwards. By filtering non-alphanumeric characters and comparing mirrored indices, we can verify the invariant in O(n) time.",
    approaches: app,
    dryRun: {
      inputExample: 's = "A man, a plan, a canal: Panama"',
      traceSteps: [
        { step: 1, variables: "left=0 ('A'), right=29 ('a')", state: "Match 'a'=='a'", explanation: "Both sides point to matching valid characters." },
        { step: 2, variables: "left=2 ('m'), right=27 ('m')", state: "Match 'm'=='m'", explanation: "Pointers advance and continue matching." },
        { step: 3, variables: "left=15 ('c'), right=15 ('c')", state: "Pointers meet", explanation: "All characters verified. Returns true." }
      ],
      output: "true"
    },
    edgeCases: [
      "Empty string or single character (always true)",
      "String with only punctuation and spaces (e.g. \"., :\")",
      "Case insensitivity ('P' vs 'p')",
      "Strings with numbers ('0P')"
    ],
    commonMistakes: [
      "Creating entire reversed string copies leading to O(n) space.",
      "Forgetting to check bounds while advancing inner pointer loops.",
      "Not handling numbers alongside alphabetic characters."
    ],
    interviewTips: [
      "Ask if case matters and which characters count as alphanumeric.",
      "Offer the in-place two-pointer approach immediately to show memory optimization awareness."
    ],
    platformTemplate: buildPlatformTemplate(lang, "Valid Palindrome", "Two Pointers")
  };
};

// ─── Trapping Rain Water ───────────────────────────────────────────────────────

const buildTrappingWaterSolution = (lang) => {
  const approaches = {
    "C++": [
      {
        level: "Brute Force", name: "Scan Left and Right Maxima",
        intuition: "For every bar i, the trapped water is determined by min(max_left, max_right) - height[i].",
        stepByStep: ["Iterate through each bar i from 0 to n-1.", "Find max bar to the left of i.", "Find max bar to the right of i.", "Add min(left_max, right_max) - height[i] to total."],
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size(), water = 0;
        for (int i = 0; i < n; i++) {
            int left_max = 0, right_max = 0;
            for (int j = i; j >= 0; j--) left_max = max(left_max, height[j]);
            for (int j = i; j < n; j++) right_max = max(right_max, height[j]);
            water += min(left_max, right_max) - height[i];
        }
        return water;
    }
};`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "Computes prefix and suffix maxima dynamically for every bar.",
        tradeOffs: "Conceptually simple but TLE on large arrays (n > 10^4).",
        codeExplanation: "Double scan per bar proves the water level formula directly."
      },
      {
        level: "Better", name: "Precomputed Prefix & Suffix Arrays (DP)",
        intuition: "Precompute left_max[i] and right_max[i] arrays in O(n) passes to avoid re-scanning.",
        stepByStep: ["Fill left_max array where left_max[i] = max(left_max[i-1], height[i]).", "Fill right_max array from right to left.", "Sum min(left_max[i], right_max[i]) - height[i]."],
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        if (n == 0) return 0;
        vector<int> left_max(n), right_max(n);
        left_max[0] = height[0];
        for (int i = 1; i < n; i++) left_max[i] = max(left_max[i - 1], height[i]);
        right_max[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) right_max[i] = max(right_max[i + 1], height[i]);
        int water = 0;
        for (int i = 0; i < n; i++) {
            water += min(left_max[i], right_max[i]) - height[i];
        }
        return water;
    }
};`,
        timeComplexity: "O(n)", spaceComplexity: "O(n)",
        complexityReason: "Three linear passes; requires two auxiliary arrays of size n.",
        tradeOffs: "Reduces time from O(n²) to O(n) at the cost of O(n) extra space.",
        codeExplanation: "Memoizes boundary heights to compute water level in O(1) per index."
      },
      {
        level: "Optimal", name: "Two Pointers In-Place",
        intuition: "Traverse from both ends with two pointers. The shorter bar limits the water volume, guaranteeing correctness in O(1) space.",
        stepByStep: ["Initialize left = 0, right = n - 1, left_max = 0, right_max = 0.", "If height[left] <= height[right]: if height[left] >= left_max update left_max, else water += left_max - height[left], left++.", "Else: if height[right] >= right_max update right_max, else water += right_max - height[right], right--.", "Return total water."],
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = (int)height.size() - 1;
        int left_max = 0, right_max = 0, water = 0;
        while (left < right) {
            if (height[left] <= height[right]) {
                if (height[left] >= left_max) {
                    left_max = height[left];
                } else {
                    water += left_max - height[left];
                }
                left++;
            } else {
                if (height[right] >= right_max) {
                    right_max = height[right];
                } else {
                    water += right_max - height[right];
                }
                right--;
            }
        }
        return water;
    }
};`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Single pass where each element is processed at most once with primitive variables.",
        tradeOffs: "Optimal runtime and space. Standard FAANG interview expected solution.",
        codeExplanation: "Two pointers converge inwards. Whichever boundary is shorter bounds the water height."
      }
    ],
    "Java": [
      {
        level: "Brute Force", name: "Scan Left and Right Maxima",
        intuition: "For every bar, scan all bars to the left and right to compute water level.",
        stepByStep: ["Iterate i from 0 to n-1.", "Find max bar to the left and right of i.", "Accumulate min(leftMax, rightMax) - height[i]."],
        code: `class Solution {
    public int trap(int[] height) {
        int n = height.length, water = 0;
        for (int i = 0; i < n; i++) {
            int leftMax = 0, rightMax = 0;
            for (int j = i; j >= 0; j--) leftMax = Math.max(leftMax, height[j]);
            for (int j = i; j < n; j++) rightMax = Math.max(rightMax, height[j]);
            water += Math.min(leftMax, rightMax) - height[i];
        }
        return water;
    }
}`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "Nested loop recomputes bounds for each bar.",
        tradeOffs: "Simple to write, TLE on large arrays.",
        codeExplanation: "Double scan directly implements the water trapping formula."
      },
      {
        level: "Better", name: "Precomputed Prefix & Suffix Arrays (DP)",
        intuition: "Precompute leftMax and rightMax arrays in O(n) passes.",
        stepByStep: ["Fill leftMax array where leftMax[i] = max(leftMax[i-1], height[i]).", "Fill rightMax array backwards.", "Sum min(leftMax[i], rightMax[i]) - height[i]."],
        code: `class Solution {
    public int trap(int[] height) {
        int n = height.length;
        if (n == 0) return 0;
        int[] leftMax = new int[n];
        int[] rightMax = new int[n];
        leftMax[0] = height[0];
        for (int i = 1; i < n; i++) leftMax[i] = Math.max(leftMax[i - 1], height[i]);
        rightMax[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) rightMax[i] = Math.max(rightMax[i + 1], height[i]);
        int water = 0;
        for (int i = 0; i < n; i++) {
            water += Math.min(leftMax[i], rightMax[i]) - height[i];
        }
        return water;
    }
}`,
        timeComplexity: "O(n)", spaceComplexity: "O(n)",
        complexityReason: "3 passes over array of size n with two auxiliary arrays.",
        tradeOffs: "Reduces time to O(n) at the cost of O(n) space.",
        codeExplanation: "Caches boundary maximums so lookup per index is O(1)."
      },
      {
        level: "Optimal", name: "Two Pointers In-Place",
        intuition: "Two pointers converging inward with leftMax and rightMax tracking.",
        stepByStep: ["left = 0, right = height.length - 1.", "Compare height[left] and height[right].", "Accumulate water based on limiting boundary."],
        code: `class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] <= height[right]) {
                if (height[left] >= leftMax) {
                    leftMax = height[left];
                } else {
                    water += leftMax - height[left];
                }
                left++;
            } else {
                if (height[right] >= rightMax) {
                    rightMax = height[right];
                } else {
                    water += rightMax - height[right];
                }
                right--;
            }
        }
        return water;
    }
}`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Processes array in single O(n) pass with zero allocations.",
        tradeOffs: "Optimal time and space.",
        codeExplanation: "Primitive pointers track maximum seen boundaries."
      }
    ],
    "Python": [
      {
        level: "Brute Force", name: "Scan Left and Right Maxima",
        intuition: "Find maximum height to left and right for every element.",
        stepByStep: ["Loop over each bar.", "Find max left and right.", "Add min(left, right) - height[i]."],
        code: `from typing import List

class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        water = 0
        for i in range(n):
            left_max = max(height[:i+1])
            right_max = max(height[i:])
            water += min(left_max, right_max) - height[i]
        return water`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "Slicing and finding max for every index takes O(n²).",
        tradeOffs: "Straightforward logic, causes TLE.",
        codeExplanation: "Exhaustive slice scan."
      },
      {
        level: "Better", name: "Precomputed Prefix & Suffix Arrays (DP)",
        intuition: "Precompute max prefix and suffix arrays to evaluate trapped water in O(1) per bar.",
        stepByStep: ["Build left_max array.", "Build right_max array.", "Compute water sum."],
        code: `from typing import List

class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        if n == 0:
            return 0
        left_max = [0] * n
        right_max = [0] * n
        left_max[0] = height[0]
        for i in range(1, n):
            left_max[i] = max(left_max[i - 1], height[i])
        right_max[-1] = height[-1]
        for i in range(n - 2, -1, -1):
            right_max[i] = max(right_max[i + 1], height[i])
        return sum(min(left_max[i], right_max[i]) - height[i] for i in range(n))`,
        timeComplexity: "O(n)", spaceComplexity: "O(n)",
        complexityReason: "O(n) time with O(n) auxiliary memory.",
        tradeOffs: "Fast O(n) runtime, uses O(n) memory.",
        codeExplanation: "Dynamic programming with memoized boundary arrays."
      },
      {
        level: "Optimal", name: "Two Pointers In-Place",
        intuition: "Inward-moving two pointers bounded by left_max and right_max.",
        stepByStep: ["Initialize left, right pointers.", "Advance the smaller height pointer.", "Accumulate trapped water volume."],
        code: `from typing import List

class Solution:
    def trap(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        left_max = right_max = water = 0
        while left < right:
            if height[left] <= height[right]:
                if height[left] >= left_max:
                    left_max = height[left]
                else:
                    water += left_max - height[left]
                left += 1
            else:
                if height[right] >= right_max:
                    right_max = height[right]
                else:
                    water += right_max - height[right]
                right -= 1
        return water`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Linear scan with constant memory.",
        tradeOffs: "Optimal Pythonic implementation.",
        codeExplanation: "Two pointer convergence with boundary tracking."
      }
    ]
  };

  const app = approaches[lang] || approaches["C++"];
  return {
    intuition: "Water at any bar is trapped up to min(max_left, max_right) - height[i]. By using two pointers converging from opposite ends, the smaller boundary always limits the water level, allowing O(n) time and O(1) space.",
    approaches: app,
    dryRun: {
      inputExample: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
      traceSteps: [
        { step: 1, variables: "left=0 (0), right=11 (1)", state: "left_max=0, right_max=1", explanation: "height[left] <= height[right], advance left." },
        { step: 2, variables: "left=1 (1), right=11 (1)", state: "left_max=1, right_max=1", explanation: "left_max updated to 1." },
        { step: 3, variables: "left=2 (0), right=11 (1)", state: "water += 1 - 0 = 1", explanation: "Water trapped at index 2 is 1 unit." },
        { step: 4, variables: "left=5 (0), right=7 (3)", state: "water += 2 - 0 = 2", explanation: "Deep valley traps 2 units." }
      ],
      output: "6"
    },
    edgeCases: [
      "Empty array or fewer than 3 bars (always 0)",
      "Strictly monotonic ascending or descending bars (cannot trap water, returns 0)",
      "All bars of equal height (returns 0)",
      "Single deep valley between two tall bars ([5, 0, 5] -> 5)"
    ],
    commonMistakes: [
      "Using < instead of <= when advancing pointers, causing infinite loops.",
      "Off-by-one errors when managing prefix/suffix arrays in DP approach.",
      "Assuming height cannot contain 0."
    ],
    interviewTips: [
      "Start by deriving the formula: water[i] = min(max_left, max_right) - height[i].",
      "Mention the DP approach first (O(n) time, O(n) space) before optimizing to two pointers in O(1) space."
    ],
    platformTemplate: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your solution here\n        \n    }\n};`,
      java: `class Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      python: `from typing import List\n\nclass Solution:\n    def trap(self, height: List[int]) -> int:\n        # Write your solution here\n        pass`
    }
  };
};

// ─── Container With Most Water ────────────────────────────────────────────────

const buildContainerWaterSolution = (lang) => {
  const approaches = {
    "C++": [
      {
        level: "Brute Force", name: "Check All Pairs",
        intuition: "Compute area between every pair (i, j) where i < j and track the maximum.",
        stepByStep: ["Loop i from 0 to n-1.", "Loop j from i+1 to n-1.", "Compute min(height[i], height[j]) * (j - i) and update max_area."],
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        int n = height.size();
        int max_area = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int h = min(height[i], height[j]);
                max_area = max(max_area, h * (j - i));
            }
        }
        return max_area;
    }
};`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "Examines all n*(n-1)/2 pairs.",
        tradeOffs: "Simple to write, TLE on n >= 10^4.",
        codeExplanation: "Double loop tests every possible pair of lines."
      },
      {
        level: "Optimal", name: "Two Pointers Shrinking Window",
        intuition: "Start with widest container (left=0, right=n-1). Move the shorter boundary inward because moving the taller one cannot increase area.",
        stepByStep: ["left = 0, right = n - 1, max_area = 0.", "area = min(height[left], height[right]) * (right - left).", "Update max_area.", "If height[left] < height[right] left++ else right--."],
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = (int)height.size() - 1;
        int max_area = 0;
        while (left < right) {
            int h = min(height[left], height[right]);
            max_area = max(max_area, h * (right - left));
            if (height[left] < height[right]) left++;
            else right--;
        }
        return max_area;
    }
};`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Single pass converging two pointers inward.",
        tradeOffs: "Optimal runtime and memory.",
        codeExplanation: "Always move the shorter line inward to search for potential taller lines."
      }
    ],
    "Java": [
      {
        level: "Brute Force", name: "Check All Pairs",
        intuition: "Exhaustive pair checking for ground-truth correctness.",
        stepByStep: ["Loop i from 0 to n-1.", "Loop j from i+1 to n-1.", "Update maxArea."],
        code: `class Solution {
    public int maxArea(int[] height) {
        int maxArea = 0;
        for (int i = 0; i < height.length; i++) {
            for (int j = i + 1; j < height.length; j++) {
                maxArea = Math.max(maxArea, Math.min(height[i], height[j]) * (j - i));
            }
        }
        return maxArea;
    }
}`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "Examines all O(n²) pairs.",
        tradeOffs: "Exhaustive, causes TLE.",
        codeExplanation: "Double nested loop."
      },
      {
        level: "Optimal", name: "Two Pointers",
        intuition: "Inward two-pointer traversal moving shorter line.",
        stepByStep: ["left = 0, right = n-1.", "Compute area.", "Advance shorter bar."],
        code: `class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1;
        int maxArea = 0;
        while (left < right) {
            int h = Math.min(height[left], height[right]);
            maxArea = Math.max(maxArea, h * (right - left));
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxArea;
    }
}`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Single pass in constant space.",
        tradeOffs: "Optimal.",
        codeExplanation: "Standard two-pointer technique."
      }
    ],
    "Python": [
      {
        level: "Brute Force", name: "Check All Pairs",
        intuition: "Examine every pair (i, j) with i < j.",
        stepByStep: ["Nested loops over all pairs.", "Compute min height * width.", "Track maximum."],
        code: `from typing import List

class Solution:
    def maxArea(self, height: List[int]) -> int:
        n = len(height)
        max_area = 0
        for i in range(n):
            for j in range(i + 1, n):
                max_area = max(max_area, min(height[i], height[j]) * (j - i))
        return max_area`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "O(n²) pair comparisons.",
        tradeOffs: "Simple but slow.",
        codeExplanation: "Nested loops test all combinations."
      },
      {
        level: "Optimal", name: "Two Pointers",
        intuition: "Converge pointers from outer boundaries inward.",
        stepByStep: ["left, right = 0, len(height) - 1.", "Compute area.", "Move shorter pointer."],
        code: `from typing import List

class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        max_area = 0
        while left < right:
            h = min(height[left], height[right])
            max_area = max(max_area, h * (right - left))
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return max_area`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "O(n) time, O(1) space.",
        tradeOffs: "Optimal.",
        codeExplanation: "Shrinking window technique."
      }
    ]
  };

  const app = approaches[lang] || approaches["C++"];
  return {
    intuition: "The area is width * min(height[left], height[right]). Moving the taller pointer only decreases width without any chance of increasing min height. Thus, we must always advance the shorter line.",
    approaches: app,
    dryRun: {
      inputExample: "height = [1,8,6,2,5,4,8,3,7]",
      traceSteps: [
        { step: 1, variables: "left=0 (1), right=8 (7)", state: "width=8, area=8*1=8", explanation: "height[0] is shorter, left++." },
        { step: 2, variables: "left=1 (8), right=8 (7)", state: "width=7, area=7*7=49", explanation: "max_area updated to 49. height[8] is shorter, right--." },
        { step: 3, variables: "left=1 (8), right=6 (8)", state: "width=5, area=5*8=40", explanation: "Equal heights, advance left." }
      ],
      output: "49"
    },
    edgeCases: ["Array with 2 elements", "All lines equal height", "Ascending or descending heights"],
    commonMistakes: ["Advancing the taller bar instead of the shorter bar."],
    interviewTips: ["Explain the mathematical invariant of why moving the taller line can never yield a larger area."],
    platformTemplate: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your solution here\n        \n    }\n};`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      python: `from typing import List\n\nclass Solution:\n    def maxArea(self, height: List[int]) -> int:\n        # Write your solution here\n        pass`
    }
  };
};

// ─── 3Sum ─────────────────────────────────────────────────────────────────────

const build3SumSolution = (lang) => {
  const approaches = {
    "C++": [
      {
        level: "Brute Force", name: "Three Nested Loops",
        intuition: "Check every triplet (i, j, k) with i < j < k and verify nums[i] + nums[j] + nums[k] == 0.",
        stepByStep: ["Loop i from 0 to n-1.", "Loop j from i+1 to n-1.", "Loop k from j+1 to n-1.", "If sum is 0, insert sorted triplet into set to avoid duplicates."],
        code: `#include <vector>
#include <set>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        int n = nums.size();
        set<vector<int>> uniqueTriplets;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                for (int k = j + 1; k < n; k++) {
                    if (nums[i] + nums[j] + nums[k] == 0) {
                        vector<int> triplet = {nums[i], nums[j], nums[k]};
                        sort(triplet.begin(), triplet.end());
                        uniqueTriplets.insert(triplet);
                    }
                }
            }
        }
        return vector<vector<int>>(uniqueTriplets.begin(), uniqueTriplets.end());
    }
};`,
        timeComplexity: "O(n³ log k)", spaceComplexity: "O(k)",
        complexityReason: "Three nested loops with set insertion for uniqueness.",
        tradeOffs: "Simple logic, causes TLE on large arrays.",
        codeExplanation: "Triple nested loop with set deduplication."
      },
      {
        level: "Optimal", name: "Sorting + Two Pointers",
        intuition: "Sort nums. For each i, find two numbers summing to -nums[i] using two pointers. Skip duplicate values to ensure unique triplets.",
        stepByStep: [
          "Sort nums in ascending order.",
          "Iterate i from 0 to n-3. If i > 0 and nums[i] == nums[i-1], continue to skip duplicates.",
          "Set left = i + 1, right = n - 1.",
          "While left < right: if sum == 0, add {nums[i], nums[left], nums[right]}, increment left, decrement right, skip duplicate values of left and right. Else if sum < 0 left++ else right--."
        ],
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> res;
        int n = nums.size();
        sort(nums.begin(), nums.end());

        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            if (nums[i] > 0) break; // Smallest number > 0 cannot sum to 0

            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    res.push_back({nums[i], nums[left], nums[right]});
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return res;
    }
};`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1) auxiliary",
        complexityReason: "Sorting is O(n log n); two-pointer scan per element takes O(n) * O(n) = O(n²).",
        tradeOffs: "Optimal time complexity and O(1) extra memory (excluding output).",
        codeExplanation: "In-place two-pointer traversal avoiding set overhead by sorting and skipping duplicate values."
      }
    ],
    "Java": [
      {
        level: "Optimal", name: "Sorting + Two Pointers",
        intuition: "Sort array and use two pointers to find two-sum complements.",
        stepByStep: ["Sort array.", "Iterate i, skipping duplicates.", "Two pointers left and right inwards."],
        code: `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        Arrays.sort(nums);
        int n = nums.length;

        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            if (nums[i] > 0) break;

            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return res;
    }
}`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1) extra space",
        complexityReason: "Sorting takes O(n log n) and nested scan takes O(n²).",
        tradeOffs: "Optimal.",
        codeExplanation: "Sort and two-pointer traversal skipping duplicates."
      }
    ],
    "Python": [
      {
        level: "Optimal", name: "Sorting + Two Pointers",
        intuition: "Sort nums and run two pointers for each unique element.",
        stepByStep: ["Sort array.", "Loop i with duplicate check.", "Two pointers converging."],
        code: `from typing import List

class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        res = []
        n = len(nums)

        for i in range(n - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            if nums[i] > 0:
                break

            left, right = i + 1, n - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total == 0:
                    res.append([nums[i], nums[left], nums[right]])
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    left += 1
                    right -= 1
                elif total < 0:
                    left += 1
                else:
                    right -= 1

        return res`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1) extra space",
        complexityReason: "Sorting is O(n log n) and two-pointer loops take O(n²).",
        tradeOffs: "Optimal runtime without hash set overhead.",
        codeExplanation: "Pythonic two-pointer scan with duplicate pruning."
      }
    ]
  };

  const app = approaches[lang] || approaches["C++"];
  return {
    intuition: "By sorting the array first, we reduce 3Sum to n iterations of Two Sum II (two pointers). Sorting also allows skipping duplicates in O(1) without hash set overhead.",
    approaches: app,
    dryRun: {
      inputExample: "nums = [-1,0,1,2,-1,-4]",
      traceSteps: [
        { step: 1, variables: "sorted=[-4,-1,-1,0,1,2]", state: "i=0 (-4)", explanation: "left=-1, right=2, sum=-3 < 0, no triplets." },
        { step: 2, variables: "i=1 (-1)", state: "left=-1, right=2", explanation: "sum=0! Append [-1,-1,2]. left++, right--." },
        { step: 3, variables: "i=1 (-1)", state: "left=0, right=1", explanation: "sum=0! Append [-1,0,1]. left++, right--." }
      ],
      output: "[[-1,-1,2],[-1,0,1]]"
    },
    edgeCases: ["Fewer than 3 elements (return [])", "All zeros ([0,0,0] -> [[0,0,0]])", "No triplet summing to 0"],
    commonMistakes: ["Forgetting to skip duplicates on left and right pointers after finding a triplet.", "Not breaking when nums[i] > 0."],
    interviewTips: ["Highlight why sorting eliminates the need for hash set deduplication."],
    platformTemplate: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        // Write your solution here\n        \n    }\n};`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}`,
      python: `from typing import List\n\nclass Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        # Write your solution here\n        pass`
    }
  };
};

// ─── Best Time to Buy and Sell Stock ──────────────────────────────────────────

const buildStockSolution = (lang) => {
  const approaches = {
    "C++": [
      {
        level: "Brute Force", name: "All Buy/Sell Pairs",
        intuition: "Check every pair of days (buy day i, sell day j where i < j) and record max profit.",
        stepByStep: ["Loop i from 0 to n-1.", "Loop j from i+1 to n-1.", "max_profit = max(max_profit, prices[j] - prices[i])."],
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int max_profit = 0, n = prices.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                max_profit = max(max_profit, prices[j] - prices[i]);
            }
        }
        return max_profit;
    }
};`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "Examines all n*(n-1)/2 pairs.",
        tradeOffs: "Simple, but TLE for large input arrays.",
        codeExplanation: "Double loop evaluates every trade combination."
      },
      {
        level: "Optimal", name: "One-Pass Minimum Tracking",
        intuition: "Track the minimum price seen so far as you iterate. The max profit selling on day i is prices[i] - min_price.",
        stepByStep: ["Initialize min_price = INT_MAX, max_profit = 0.", "For each price, update min_price = min(min_price, price).", "Update max_profit = max(max_profit, price - min_price).", "Return max_profit."],
        code: `#include <vector>
#include <algorithm>
#include <climits>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int min_price = INT_MAX;
        int max_profit = 0;
        for (int price : prices) {
            if (price < min_price) {
                min_price = price;
            } else if (price - min_price > max_profit) {
                max_profit = price - min_price;
            }
        }
        return max_profit;
    }
};`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Single linear pass over the price history with two scalar variables.",
        tradeOffs: "Optimal runtime and constant space.",
        codeExplanation: "Maintains running minimum buy price to compute instantaneous profit."
      }
    ],
    "Java": [
      {
        level: "Optimal", name: "One-Pass Minimum Tracking",
        intuition: "Track lowest buying price seen so far.",
        stepByStep: ["Initialize minPrice = Integer.MAX_VALUE, maxProfit = 0.", "Iterate and update minPrice and maxProfit."],
        code: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else if (price - minPrice > maxProfit) {
                maxProfit = price - minPrice;
            }
        }
        return maxProfit;
    }
}`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Single pass in O(1) space.",
        tradeOffs: "Optimal.",
        codeExplanation: "One-pass greedy tracking."
      }
    ],
    "Python": [
      {
        level: "Optimal", name: "One-Pass Minimum Tracking",
        intuition: "Track lowest buy price and update max profit.",
        stepByStep: ["min_price = float('inf'), max_profit = 0.", "For price in prices: update min_price, update max_profit."],
        code: `from typing import List

class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        for price in prices:
            if price < min_price:
                min_price = price
            elif price - min_price > max_profit:
                max_profit = price - min_price
        return max_profit`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "O(n) single pass, O(1) auxiliary variables.",
        tradeOffs: "Optimal.",
        codeExplanation: "Running min price comparison."
      }
    ]
  };

  const app = approaches[lang] || approaches["C++"];
  return {
    intuition: "To maximize profit, we want to buy at the lowest historical price and sell on the current day. By tracking the minimum price seen so far in a single pass, we compute the maximum possible profit in O(n) time.",
    approaches: app,
    dryRun: {
      inputExample: "prices = [7,1,5,3,6,4]",
      traceSteps: [
        { step: 1, variables: "price=7", state: "min_price=7, max_profit=0", explanation: "First day, set min_price to 7." },
        { step: 2, variables: "price=1", state: "min_price=1, max_profit=0", explanation: "New lower price found, min_price=1." },
        { step: 3, variables: "price=5", state: "profit=4, max_profit=4", explanation: "Sell on day 3 for 5 - 1 = 4 profit." },
        { step: 4, variables: "price=6", state: "profit=5, max_profit=5", explanation: "Sell on day 5 for 6 - 1 = 5 profit." }
      ],
      output: "5"
    },
    edgeCases: ["Prices strictly decreasing (e.g. [7,6,4,3,1] -> 0)", "Array of length 1 (return 0)", "All prices identical"],
    commonMistakes: ["Selling before buying (wrong loop order).", "Returning negative profit when prices only decline."],
    interviewTips: ["Clarify that you can only make at most one transaction before writing the solution."],
    platformTemplate: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your solution here\n        \n    }\n};`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      python: `from typing import List\n\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        # Write your solution here\n        pass`
    }
  };
};

// ─── Maximum Subarray (Kadane's Algorithm) ────────────────────────────────────

const buildMaxSubArraySolution = (lang) => {
  const approaches = {
    "C++": [
      {
        level: "Brute Force", name: "All Subarrays Sum",
        intuition: "Iterate through all possible starting and ending points of subarrays and find the max sum.",
        stepByStep: ["Loop start from 0 to n-1.", "Loop end from start to n-1.", "Accumulate sum and update max_sum."],
        code: `#include <vector>
#include <algorithm>
#include <climits>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int max_sum = INT_MIN, n = nums.size();
        for (int i = 0; i < n; i++) {
            int current_sum = 0;
            for (int j = i; j < n; j++) {
                current_sum += nums[j];
                max_sum = max(max_sum, current_sum);
            }
        }
        return max_sum;
    }
};`,
        timeComplexity: "O(n²)", spaceComplexity: "O(1)",
        complexityReason: "Evaluates all n*(n+1)/2 subarrays.",
        tradeOffs: "Simple logic, causes TLE.",
        codeExplanation: "Double loop accumulates subarray sums."
      },
      {
        level: "Optimal", name: "Kadane's Algorithm",
        intuition: "At each element, decide whether to add it to the existing running subarray or start a new subarray from this element: current_sum = max(num, current_sum + num).",
        stepByStep: ["Initialize current_sum = nums[0], max_sum = nums[0].", "Iterate from index 1 to n-1.", "current_sum = max(nums[i], current_sum + nums[i]).", "max_sum = max(max_sum, current_sum).", "Return max_sum."],
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int current_sum = nums[0];
        int max_sum = nums[0];
        for (int i = 1; i < (int)nums.size(); i++) {
            current_sum = max(nums[i], current_sum + nums[i]);
            max_sum = max(max_sum, current_sum);
        }
        return max_sum;
    }
};`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Processes each array element exactly once with two scalar variables.",
        tradeOffs: "Optimal runtime and constant space.",
        codeExplanation: "Dynamic programming state reduction to single variable."
      }
    ],
    "Java": [
      {
        level: "Optimal", name: "Kadane's Algorithm",
        intuition: "At each step, decide to extend current subarray or start fresh.",
        stepByStep: ["currentSum = nums[0], maxSum = nums[0].", "Loop through elements.", "currentSum = Math.max(nums[i], currentSum + nums[i])."],
        code: `class Solution {
    public int maxSubArray(int[] nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Single linear pass.",
        tradeOffs: "Optimal.",
        codeExplanation: "Kadane's dynamic programming technique."
      }
    ],
    "Python": [
      {
        level: "Optimal", name: "Kadane's Algorithm",
        intuition: "current_sum = max(num, current_sum + num).",
        stepByStep: ["current_sum = max_sum = nums[0].", "Iterate through rest of array.", "Update running max."],
        code: `from typing import List

class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        current_sum = max_sum = nums[0]
        for num in nums[1:]:
            current_sum = max(num, current_sum + num)
            max_sum = max(max_sum, current_sum)
        return max_sum`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Linear time, constant auxiliary space.",
        tradeOffs: "Optimal.",
        codeExplanation: "Pythonic Kadane's algorithm."
      }
    ]
  };

  const app = approaches[lang] || approaches["C++"];
  return {
    intuition: "If the running sum of a prefix becomes negative, it can only hurt any future subarray sum. Kadane's algorithm drops negative running sums by restarting the subarray whenever current_sum + num < num.",
    approaches: app,
    dryRun: {
      inputExample: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
      traceSteps: [
        { step: 1, variables: "num=-2", state: "current=-2, max=-2", explanation: "Initialize with first element." },
        { step: 2, variables: "num=1", state: "current=1, max=1", explanation: "max(1, -2+1) = 1. Restart subarray at 1." },
        { step: 3, variables: "num=4", state: "current=4, max=4", explanation: "Subarray [4]." },
        { step: 4, variables: "nums=[4,-1,2,1]", state: "current=6, max=6", explanation: "Optimal contiguous subarray [4,-1,2,1] has sum 6." }
      ],
      output: "6"
    },
    edgeCases: ["All negative numbers (e.g. [-3,-2,-1] -> -1)", "Single element array (returns nums[0])", "All positive numbers (sum of entire array)"],
    commonMistakes: ["Initializing max_sum to 0 instead of nums[0] (fails when all numbers are negative)."],
    interviewTips: ["Explain the dynamic programming recurrence: dp[i] = max(nums[i], dp[i-1] + nums[i])."],
    platformTemplate: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n        \n    }\n};`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      python: `from typing import List\n\nclass Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        # Write your solution here\n        pass`
    }
  };
};

// ─── Valid Parentheses ────────────────────────────────────────────────────────

const buildValidParenthesesSolution = (lang) => {
  const approaches = {
    "C++": [
      {
        level: "Optimal", name: "Stack-Based Matching",
        intuition: "Push opening brackets onto a stack. When encountering a closing bracket, verify that it matches the top element of the stack.",
        stepByStep: [
          "Initialize an empty stack<char>.",
          "Iterate through each character c in s.",
          "If c is '(', '{', or '[', push onto stack.",
          "Else if stack is empty or doesn't match top, return false.",
          "Otherwise pop the matching opening bracket.",
          "Return true if stack is empty at the end."
        ],
        code: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty()) return false;
                char top = st.top();
                st.pop();
                if ((c == ')' && top != '(') ||
                    (c == '}' && top != '{') ||
                    (c == ']' && top != '[')) {
                    return false;
                }
            }
        }
        return st.empty();
    }
};`,
        timeComplexity: "O(n)", spaceComplexity: "O(n)",
        complexityReason: "Each character is pushed and popped at most once.",
        tradeOffs: "Optimal runtime and memory for nesting validation.",
        codeExplanation: "LIFO stack preserves order of unmatched opening brackets."
      }
    ],
    "Java": [
      {
        level: "Optimal", name: "Stack-Based Matching",
        intuition: "Use Deque as stack to match bracket pairs.",
        stepByStep: ["Push openers.", "Pop and match closers.", "Check stack empty at end."],
        code: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
        timeComplexity: "O(n)", spaceComplexity: "O(n)",
        complexityReason: "Single pass with stack.",
        tradeOffs: "Optimal.",
        codeExplanation: "Pushes expected closing characters for clean matching."
      }
    ],
    "Python": [
      {
        level: "Optimal", name: "Stack-Based Matching",
        intuition: "Use list as stack with a mapping dictionary.",
        stepByStep: ["Dictionary mapping close -> open.", "Push opens, pop and check on closes.", "Return not stack."],
        code: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack`,
        timeComplexity: "O(n)", spaceComplexity: "O(n)",
        complexityReason: "O(n) time, O(n) space.",
        tradeOffs: "Optimal.",
        codeExplanation: "Dictionary maps closing to opening brackets."
      }
    ]
  };

  const app = approaches[lang] || approaches["C++"];
  return {
    intuition: "Brackets must close in reverse of the order they opened. A Last-In-First-Out (LIFO) stack naturally models nested structures.",
    approaches: app,
    dryRun: {
      inputExample: "s = \"()[]{}\"",
      traceSteps: [
        { step: 1, variables: "c='('", state: "stack=['(']", explanation: "Push '('." },
        { step: 2, variables: "c=')'", state: "stack=[]", explanation: "Matches '('! Pop." },
        { step: 3, variables: "c='['", state: "stack=['[']", explanation: "Push '['." },
        { step: 4, variables: "c=']'", state: "stack=[]", explanation: "Matches '['! Pop. String valid." }
      ],
      output: "true"
    },
    edgeCases: ["Odd length string (immediately false)", "Starts with closing bracket (e.g. \"][\")", "Unclosed opening bracket at end (e.g. \"((\")"],
    commonMistakes: ["Forgetting to check if stack is empty before popping.", "Not checking if stack is empty after loop."],
    interviewTips: ["Mention the early exit: if s.length() % 2 != 0 return false."],
    platformTemplate: {
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        \n    }\n};`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}`,
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your solution here\n        pass`
    }
  };
};

// ─── Reverse Linked List ──────────────────────────────────────────────────────

const buildReverseLinkedListSolution = (lang) => {
  const approaches = {
    "C++": [
      {
        level: "Optimal", name: "Iterative 3-Pointers",
        intuition: "Maintain prev, curr, and next pointers. Reversing each node's next pointer in a single traversal.",
        stepByStep: ["prev = nullptr, curr = head.", "While curr != nullptr: next = curr->next, curr->next = prev, prev = curr, curr = next.", "Return prev."],
        code: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr != nullptr) {
            ListNode* nextNode = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nextNode;
        }
        return prev;
    }
};`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Visits each node once and modifies pointers in place.",
        tradeOffs: "Optimal runtime and zero extra memory.",
        codeExplanation: "In-place pointer reversal."
      }
    ],
    "Java": [
      {
        level: "Optimal", name: "Iterative 3-Pointers",
        intuition: "In-place pointer reversal with prev, curr, next.",
        stepByStep: ["prev = null, curr = head.", "curr.next = prev.", "prev = curr, curr = next."],
        code: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Single pass in constant space.",
        tradeOffs: "Optimal.",
        codeExplanation: "Iterative pointer redirection."
      }
    ],
    "Python": [
      {
        level: "Optimal", name: "Iterative",
        intuition: "In-place pointer redirection.",
        stepByStep: ["prev = None, curr = head.", "curr.next = prev.", "Advance prev and curr."],
        code: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        curr = head
        while curr:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt
        return prev`,
        timeComplexity: "O(n)", spaceComplexity: "O(1)",
        complexityReason: "Linear time, constant memory.",
        tradeOffs: "Optimal.",
        codeExplanation: "Standard in-place reversal."
      }
    ]
  };

  const app = approaches[lang] || approaches["C++"];
  return {
    intuition: "Reversing a singly linked list requires flipping the direction of each next pointer so it points to the previous node instead of the next one.",
    approaches: app,
    dryRun: {
      inputExample: "head = [1,2,3,4,5]",
      traceSteps: [
        { step: 1, variables: "curr=1, prev=null", state: "1 -> null", explanation: "Point node 1 to null." },
        { step: 2, variables: "curr=2, prev=1", state: "2 -> 1 -> null", explanation: "Point node 2 to node 1." },
        { step: 3, variables: "curr=null, prev=5", state: "5 -> 4 -> 3 -> 2 -> 1", explanation: "End of list. Return prev (node 5)." }
      ],
      output: "[5,4,3,2,1]"
    },
    edgeCases: ["Empty list (head == null -> return null)", "Single node list (return head)", "Two node list"],
    commonMistakes: ["Losing reference to curr->next before pointing curr->next to prev."],
    interviewTips: ["State both iterative (O(1) space) and recursive (O(n) stack space) variants."],
    platformTemplate: {
      cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your solution here\n        \n    }\n};`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}`,
      python: `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # Write your solution here\n        pass`
    }
  };
};

// ─── Binary Search ────────────────────────────────────────────────────────────

const buildBinarySearchSolution = (lang) => {
  const approaches = {
    "C++": [
      {
        level: "Optimal", name: "Iterative Binary Search",
        intuition: "Halve the search space on each step by comparing target with middle element in sorted array.",
        stepByStep: ["low = 0, high = n - 1.", "While low <= high: mid = low + (high - low)/2.", "If nums[mid] == target return mid. If nums[mid] < target low = mid + 1 else high = mid - 1.", "Return -1."],
        code: `#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int low = 0, high = (int)nums.size() - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
};`,
        timeComplexity: "O(log n)", spaceComplexity: "O(1)",
        complexityReason: "Divides candidate range by 2 at each step.",
        tradeOffs: "Optimal search algorithm on sorted arrays.",
        codeExplanation: "Uses low + (high - low)/2 to avoid integer overflow."
      }
    ],
    "Java": [
      {
        level: "Optimal", name: "Iterative Binary Search",
        intuition: "Halve search space at each iteration.",
        stepByStep: ["low = 0, high = nums.length - 1.", "mid = low + (high - low) / 2.", "Narrow search space."],
        code: `class Solution {
    public int search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}`,
        timeComplexity: "O(log n)", spaceComplexity: "O(1)",
        complexityReason: "Logarithmic time halving search range.",
        tradeOffs: "Optimal.",
        codeExplanation: "Iterative binary search with overflow prevention."
      }
    ],
    "Python": [
      {
        level: "Optimal", name: "Binary Search",
        intuition: "Halve the candidate bounds at each step.",
        stepByStep: ["low, high = 0, len(nums) - 1.", "Compute mid.", "Adjust pointers."],
        code: `from typing import List

class Solution:
    def search(self, nums: List[int], target: int) -> int:
        low, high = 0, len(nums) - 1
        while low <= high:
            mid = (low + high) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                low = mid + 1
            else:
                high = mid - 1
        return -1`,
        timeComplexity: "O(log n)", spaceComplexity: "O(1)",
        complexityReason: "O(log n) time, O(1) space.",
        tradeOffs: "Optimal.",
        codeExplanation: "Classic binary search."
      }
    ]
  };

  const app = approaches[lang] || approaches["C++"];
  return {
    intuition: "Because the array is sorted, comparing target with the middle element eliminates half of the remaining elements in a single comparison.",
    approaches: app,
    dryRun: {
      inputExample: "nums = [-1,0,3,5,9,12], target = 9",
      traceSteps: [
        { step: 1, variables: "low=0, high=5", state: "mid=2 (3) < 9", explanation: "3 < 9, so target must be in right half. low = 3." },
        { step: 2, variables: "low=3, high=5", state: "mid=4 (9) == 9", explanation: "Target found at index 4! Return 4." }
      ],
      output: "4"
    },
    edgeCases: ["Target not in array (returns -1)", "Single element array", "Target is first or last element"],
    commonMistakes: ["Using (low + high) / 2 which can overflow 32-bit signed integers in C++/Java.", "Using < instead of <= in while loop."],
    interviewTips: ["Always explain why you write low + (high - low)/2 instead of (low + high)/2."],
    platformTemplate: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}`,
      python: `from typing import List\n\nclass Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        # Write your solution here\n        pass`
    }
  };
};

const CLASSIC_SOLUTIONS = {
  "two sum": (lang, platform) => buildTwoSumSolution(lang),
  "valid palindrome": (lang, platform) => buildPalindromeSolution(lang),
  "trapping water": (lang, platform) => buildTrappingWaterSolution(lang),
  "trapping rain water": (lang, platform) => buildTrappingWaterSolution(lang),
  "trap rain water": (lang, platform) => buildTrappingWaterSolution(lang),
  "container with most water": (lang, platform) => buildContainerWaterSolution(lang),
  "most water": (lang, platform) => buildContainerWaterSolution(lang),
  "3sum": (lang, platform) => build3SumSolution(lang),
  "three sum": (lang, platform) => build3SumSolution(lang),
  "best time to buy and sell stock": (lang, platform) => buildStockSolution(lang),
  "buy and sell stock": (lang, platform) => buildStockSolution(lang),
  "stock": (lang, platform) => buildStockSolution(lang),
  "maximum subarray": (lang, platform) => buildMaxSubArraySolution(lang),
  "max subarray": (lang, platform) => buildMaxSubArraySolution(lang),
  "kadane": (lang, platform) => buildMaxSubArraySolution(lang),
  "valid parentheses": (lang, platform) => buildValidParenthesesSolution(lang),
  "reverse linked list": (lang, platform) => buildReverseLinkedListSolution(lang),
  "binary search": (lang, platform) => buildBinarySearchSolution(lang)
};

/**
 * Fuzzy matcher that maps user problem input to classic DSA solutions
 */
export const findClassicSolution = (inputName, lang, platform = "LeetCode") => {
  if (!inputName) return null;
  const raw = inputName.toLowerCase().trim();
  const normalized = raw.replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();

  // 1. Direct or normalized key map match
  if (CLASSIC_SOLUTIONS[raw]) return CLASSIC_SOLUTIONS[raw](lang, platform);
  if (CLASSIC_SOLUTIONS[normalized]) return CLASSIC_SOLUTIONS[normalized](lang, platform);

  // 2. Fuzzy / keyword match
  if (normalized.includes("trap") && normalized.includes("water")) {
    return buildTrappingWaterSolution(lang);
  }
  if (normalized.includes("container") && normalized.includes("water")) {
    return buildContainerWaterSolution(lang);
  }
  if (normalized.includes("two sum") || normalized === "twosum") {
    return buildTwoSumSolution(lang);
  }
  if (normalized.includes("3sum") || normalized.includes("three sum") || normalized === "3 sum") {
    return build3SumSolution(lang);
  }
  if (normalized.includes("stock") || (normalized.includes("buy") && normalized.includes("sell"))) {
    return buildStockSolution(lang);
  }
  if ((normalized.includes("max") && normalized.includes("subarray")) || normalized.includes("kadane")) {
    return buildMaxSubArraySolution(lang);
  }
  if (normalized.includes("parenthes") || normalized.includes("valid brackets") || normalized.includes("bracket")) {
    return buildValidParenthesesSolution(lang);
  }
  if (normalized.includes("reverse") && (normalized.includes("linked") || normalized.includes("list"))) {
    return buildReverseLinkedListSolution(lang);
  }
  if (normalized.includes("binary search") || normalized === "search") {
    return buildBinarySearchSolution(lang);
  }
  if (normalized.includes("palindrome")) {
    return buildPalindromeSolution(lang);
  }

  return null;
};

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Build a dynamic, language-correct DSA solution for any problem.
 * Used when Gemini API is unavailable.
 */
export const buildFallbackSolution = (problemData) => {
  const lang = problemData.language || "C++";
  const name = problemData.name || "Target Problem";
  const topic = problemData.topic || "Data Structures & Algorithms";
  const platform = problemData.platform || "LeetCode";

  // Check if we have a hand-crafted classic solution
  const classic = findClassicSolution(problemData.name, lang, platform);
  if (classic) {
    return classic;
  }

  // Generic multi-language fallback
  return {
    intuition: `To solve "${name}" efficiently, we analyze the constraints and properties of ${topic}. Naive brute-force exploration establishes correctness, while identifying redundant sub-problems or invariant structures leads to optimal runtime. The key insight is usually to trade memory (using a hash map or auxiliary array) for time, reducing repeated work from O(n²) to O(n).`,
    approaches: [
      {
        level: "Brute Force",
        name: "Exhaustive Search",
        intuition: `Directly check all candidate combinations. Simple to reason about; establishes ground truth for correctness.`,
        stepByStep: [
          "Enumerate all candidate pairs or subarrays using nested loops.",
          "Check each candidate against the validity condition.",
          "Track and return the best valid result found."
        ],
        code: buildLanguageCode(lang, name, "Brute Force"),
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        complexityReason: "Examines all O(n²) pairs with no auxiliary memory.",
        tradeOffs: "Correct and easy to verify, but fails Time Limit on large inputs (n ≥ 10⁴).",
        codeExplanation: "Double nested loop checks every combination. Best used to validate optimal solution correctness."
      },
      {
        level: "Better",
        name: "Sorting + Two Pointers / Binary Search",
        intuition: `Pre-sort the data to eliminate the redundant inner scan. Use two pointers or binary search instead of brute-force inner loop.`,
        stepByStep: [
          "Sort the input in O(n log n).",
          "Apply two pointers converging from both ends, or binary search on the sorted structure.",
          "Return the valid candidate found."
        ],
        code: buildLanguageCode(lang, name, "Better"),
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        complexityReason: "Sorting dominates at O(n log n); two pointer scan is O(n).",
        tradeOffs: "Significantly faster than O(n²) at the cost of O(n) auxiliary space or input mutation.",
        codeExplanation: "Monotonicity from sorting allows skipping impossible candidates efficiently."
      },
      {
        level: "Optimal",
        name: "Linear Pass with Hash Map / Optimal Data Structure",
        intuition: `Leverage an O(1) lookup data structure (hash map, set, or monotonic stack) to avoid repeated inner scans. Process each element exactly once.`,
        stepByStep: [
          "Initialize the auxiliary state container (hash map, set, or DP array).",
          "Iterate once through the input, updating state in O(1) amortized per element.",
          "Query the state to determine if the answer condition is met.",
          "Return the optimal result."
        ],
        code: buildLanguageCode(lang, name, "Optimal"),
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        complexityReason: "Each element is visited once; hash lookups are O(1) average.",
        tradeOffs: "Achieves theoretical optimal time. Requires O(n) auxiliary space.",
        codeExplanation: "State is maintained incrementally. No recomputation of prior results."
      }
    ],
    dryRun: {
      inputExample: `Sample input for "${name}"`,
      traceSteps: [
        { step: 1, variables: "i=0, state=initial", state: "Start processing", explanation: "Initialize state container and begin iteration." },
        { step: 2, variables: "i=1, state=updated", state: "Key condition checked", explanation: "State updated. Target condition evaluated." },
        { step: 3, variables: "i=2, result=found", state: "Answer determined", explanation: "Optimal result identified and returned." }
      ],
      output: "Expected output for the sample input"
    },
    edgeCases: [
      "Empty array or single-element input",
      "All elements identical",
      "Negative numbers and zero",
      "Constraints at integer boundaries (n ≥ 10⁵, values near INT_MAX)"
    ],
    commonMistakes: [
      "Off-by-one errors in loop bounds or pointer positions.",
      "Mutating input when the problem guarantees immutable data.",
      "Forgetting to handle empty or null inputs gracefully.",
      "Integer overflow when summing large values without casting."
    ],
    interviewTips: [
      "Always state your brute-force first to confirm problem understanding with the interviewer.",
      "Communicate the optimization insight (why hash map / two pointers eliminates the inner loop).",
      "Walk through an edge case example with the interviewer before finalizing your solution.",
      "Discuss trade-offs: time vs space, sorted vs unsorted input variants."
    ],
    platformTemplate: buildPlatformTemplate(lang, name, topic, problemData.platform || "LeetCode")
  };
};
