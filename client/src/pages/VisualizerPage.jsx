import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Shuffle,
  Info,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Flame,
  Link as LinkIcon,
  ArrowLeft,
  Repeat,
  BarChart3
} from "lucide-react";

// Predefined Algorithm Configurations
const ALGORITHMS = {
  binary_search: {
    id: "binary_search",
    title: "Binary Search",
    tagline: "Logarithmic Search in Sorted Arrays (O(log n))",
    difficulty: "Easy",
    defaultArray: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
    defaultTarget: 23,
    hasTarget: true,
    requiresSorted: true,
    code: [
      "function binarySearch(arr, target) {",
      "  let low = 0, high = arr.length - 1;",
      "  while (low <= high) {",
      "    let mid = Math.floor((low + high) / 2);",
      "    if (arr[mid] === target) return mid;",
      "    else if (arr[mid] < target) low = mid + 1;",
      "    else high = mid - 1;",
      "  }",
      "  return -1;",
      "}"
    ],
    generateSteps: (arr, target) => {
      const steps = [];
      let low = 0;
      let high = arr.length - 1;

      steps.push({
        low,
        high,
        mid: -1,
        activeIndices: [],
        discardedIndices: [],
        foundIndex: -1,
        codeLine: 1,
        message: `Initialize pointers: low = 0 (arr[0]=${arr[0]}), high = ${high} (arr[${high}]=${arr[high]}). Target = ${target}.`,
        comparison: null
      });

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        
        // Discarded are indices < low or > high
        const discarded = [];
        for (let i = 0; i < low; i++) discarded.push(i);
        for (let i = high + 1; i < arr.length; i++) discarded.push(i);

        steps.push({
          low,
          high,
          mid,
          activeIndices: [mid],
          discardedIndices: [...discarded],
          foundIndex: -1,
          codeLine: 3,
          message: `Calculate midpoint: mid = Math.floor((${low} + ${high}) / 2) = ${mid}. Checking arr[${mid}] = ${arr[mid]}.`,
          comparison: `${arr[mid]} vs ${target}`
        });

        if (arr[mid] === target) {
          steps.push({
            low,
            high,
            mid,
            activeIndices: [mid],
            discardedIndices: [...discarded],
            foundIndex: mid,
            codeLine: 4,
            message: `🎯 Target match found! arr[${mid}] === ${target}. Returning index ${mid}.`,
            comparison: `${arr[mid]} === ${target}`
          });
          return steps;
        } else if (arr[mid] < target) {
          const prevLow = low;
          low = mid + 1;
          const newDiscarded = [...discarded];
          for (let i = prevLow; i <= mid; i++) {
            if (!newDiscarded.includes(i)) newDiscarded.push(i);
          }
          steps.push({
            low,
            high,
            mid,
            activeIndices: [mid],
            discardedIndices: newDiscarded,
            foundIndex: -1,
            codeLine: 5,
            message: `arr[${mid}] (${arr[mid]}) < ${target}. Target is strictly in right half. Shift low = ${mid + 1}.`,
            comparison: `${arr[mid]} < ${target}`
          });
        } else {
          const prevHigh = high;
          high = mid - 1;
          const newDiscarded = [...discarded];
          for (let i = mid; i <= prevHigh; i++) {
            if (!newDiscarded.includes(i)) newDiscarded.push(i);
          }
          steps.push({
            low,
            high,
            mid,
            activeIndices: [mid],
            discardedIndices: newDiscarded,
            foundIndex: -1,
            codeLine: 6,
            message: `arr[${mid}] (${arr[mid]}) > ${target}. Target is strictly in left half. Shift high = ${mid - 1}.`,
            comparison: `${arr[mid]} > ${target}`
          });
        }
      }

      const allDiscarded = arr.map((_, i) => i);
      steps.push({
        low,
        high,
        mid: -1,
        activeIndices: [],
        discardedIndices: allDiscarded,
        foundIndex: -1,
        codeLine: 8,
        message: `❌ low (${low}) > high (${high}). Search space exhausted. Target ${target} not found in array. Returning -1.`,
        comparison: "Not Found"
      });

      return steps;
    }
  },

  two_pointers: {
    id: "two_pointers",
    title: "Two Pointers (Two Sum II)",
    tagline: "Opposite Ends Convergence for Sorted Arrays (O(n))",
    difficulty: "Medium",
    defaultArray: [1, 3, 4, 6, 8, 9, 11, 15],
    defaultTarget: 14,
    hasTarget: true,
    requiresSorted: true,
    code: [
      "function twoSumSorted(arr, target) {",
      "  let left = 0, right = arr.length - 1;",
      "  while (left < right) {",
      "    let sum = arr[left] + arr[right];",
      "    if (sum === target) return [left, right];",
      "    else if (sum < target) left++;",
      "    else right--;",
      "  }",
      "  return [-1, -1];",
      "}"
    ],
    generateSteps: (arr, target) => {
      const steps = [];
      let left = 0;
      let right = arr.length - 1;

      steps.push({
        left,
        right,
        activeIndices: [left, right],
        discardedIndices: [],
        foundIndices: [],
        codeLine: 1,
        message: `Initialize pointers at opposite ends: left = 0 (val=${arr[0]}), right = ${right} (val=${arr[right]}). Target sum = ${target}.`,
        currentSum: arr[left] + arr[right]
      });

      while (left < right) {
        const sum = arr[left] + arr[right];
        
        steps.push({
          left,
          right,
          activeIndices: [left, right],
          discardedIndices: [],
          foundIndices: [],
          codeLine: 3,
          message: `Calculate current sum: arr[${left}] (${arr[left]}) + arr[${right}] (${arr[right]}) = ${sum}.`,
          currentSum: sum
        });

        if (sum === target) {
          steps.push({
            left,
            right,
            activeIndices: [left, right],
            discardedIndices: [],
            foundIndices: [left, right],
            codeLine: 4,
            message: `🎯 Target match found! arr[${left}] + arr[${right}] === ${target}. Indices are [${left}, ${right}].`,
            currentSum: sum
          });
          return steps;
        } else if (sum < target) {
          steps.push({
            left,
            right,
            activeIndices: [left, right],
            discardedIndices: [],
            foundIndices: [],
            codeLine: 5,
            message: `Sum (${sum}) < target (${target}). Array is sorted, so increment left from ${left} to ${left + 1} to increase sum.`,
            currentSum: sum
          });
          left++;
        } else {
          steps.push({
            left,
            right,
            activeIndices: [left, right],
            discardedIndices: [],
            foundIndices: [],
            codeLine: 6,
            message: `Sum (${sum}) > target (${target}). Decrement right from ${right} to ${right - 1} to reduce sum.`,
            currentSum: sum
          });
          right--;
        }
      }

      steps.push({
        left,
        right,
        activeIndices: [],
        discardedIndices: [],
        foundIndices: [],
        codeLine: 8,
        message: `Pointers met (left >= right). No two elements sum to ${target}. Returning [-1, -1].`,
        currentSum: null
      });

      return steps;
    }
  },

  sliding_window: {
    id: "sliding_window",
    title: "Sliding Window (Max Subarray k=3)",
    tagline: "Fixed-Size Bounding Window with O(1) Updates",
    difficulty: "Medium",
    defaultArray: [2, 1, 5, 1, 3, 2, 7, 4],
    defaultTarget: 3, // Used as K
    hasTarget: true,
    targetLabel: "Window Size (K)",
    requiresSorted: false,
    code: [
      "function maxSubarraySum(arr, k) {",
      "  let windowSum = 0, maxSum = 0;",
      "  for (let i = 0; i < k; i++) windowSum += arr[i];",
      "  maxSum = windowSum;",
      "  for (let i = k; i < arr.length; i++) {",
      "    windowSum += arr[i] - arr[i - k];",
      "    maxSum = Math.max(maxSum, windowSum);",
      "  }",
      "  return maxSum;",
      "}"
    ],
    generateSteps: (arr, kVal) => {
      const k = Math.min(Math.max(1, kVal || 3), arr.length);
      const steps = [];
      let windowSum = 0;

      // Initial window
      for (let i = 0; i < k; i++) {
        windowSum += arr[i];
      }
      let maxSum = windowSum;

      steps.push({
        windowStart: 0,
        windowEnd: k - 1,
        activeIndices: Array.from({ length: k }, (_, i) => i),
        codeLine: 2,
        windowSum,
        maxSum,
        message: `Compute initial window [0..${k - 1}] sum: ${arr.slice(0, k).join(" + ")} = ${windowSum}. Set maxSum = ${maxSum}.`
      });

      for (let i = k; i < arr.length; i++) {
        const outgoing = arr[i - k];
        const incoming = arr[i];
        windowSum = windowSum + incoming - outgoing;
        const newMax = Math.max(maxSum, windowSum);
        const updated = newMax > maxSum;
        maxSum = newMax;

        const currentWindow = [];
        for (let j = i - k + 1; j <= i; j++) currentWindow.push(j);

        steps.push({
          windowStart: i - k + 1,
          windowEnd: i,
          activeIndices: currentWindow,
          outgoingIndex: i - k,
          incomingIndex: i,
          codeLine: 5,
          windowSum,
          maxSum,
          message: `Slide window to [${i - k + 1}..${i}]: drop arr[${i - k}]=${outgoing}, add arr[${i}]=${incoming}. Current window sum = ${windowSum}.${updated ? ` 🌟 New maximum found: ${maxSum}!` : ` Max sum remains ${maxSum}.`}`
        });
      }

      steps.push({
        windowStart: arr.length - k,
        windowEnd: arr.length - 1,
        activeIndices: Array.from({ length: k }, (_, idx) => arr.length - k + idx),
        codeLine: 7,
        windowSum,
        maxSum,
        message: `🏁 Processed full array! Maximum contiguous subarray sum of size ${k} is ${maxSum}.`
      });

      return steps;
    }
  },

  dutch_flag: {
    id: "dutch_flag",
    title: "Dutch National Flag (0, 1, 2)",
    tagline: "In-Place 3-Way Partitioning (O(n) time, O(1) space)",
    difficulty: "Medium",
    defaultArray: [2, 0, 2, 1, 1, 0, 2, 1, 0],
    defaultTarget: 0,
    hasTarget: false,
    requiresSorted: false,
    code: [
      "function sortColors(nums) {",
      "  let low = 0, mid = 0, high = nums.length - 1;",
      "  while (mid <= high) {",
      "    if (nums[mid] === 0) {",
      "      swap(nums, low++, mid++);",
      "    } else if (nums[mid] === 1) {",
      "      mid++;",
      "    } else {",
      "      swap(nums, mid, high--);",
      "    }",
      "  }",
      "}"
    ],
    generateSteps: (initialArr) => {
      // Force elements to be 0, 1, or 2 for this demo
      const arr = initialArr.map(x => Math.abs(x) % 3);
      const steps = [];
      let low = 0;
      let mid = 0;
      let high = arr.length - 1;

      steps.push({
        arraySnapshot: [...arr],
        low,
        mid,
        high,
        activeIndices: [mid],
        swappedIndices: [],
        codeLine: 1,
        message: `Initialize: low = 0 (boundary for 0s), mid = 0 (current explorer), high = ${high} (boundary for 2s).`
      });

      while (mid <= high) {
        const val = arr[mid];

        if (val === 0) {
          // Swap arr[low] and arr[mid]
          const temp = arr[low];
          arr[low] = arr[mid];
          arr[mid] = temp;

          steps.push({
            arraySnapshot: [...arr],
            low,
            mid,
            high,
            activeIndices: [low, mid],
            swappedIndices: [low, mid],
            codeLine: 4,
            message: `arr[mid] === 0. Swap arr[low (${low})] with arr[mid (${mid})]. Advance both low (${low + 1}) & mid (${mid + 1}).`
          });
          low++;
          mid++;
        } else if (val === 1) {
          steps.push({
            arraySnapshot: [...arr],
            low,
            mid,
            high,
            activeIndices: [mid],
            swappedIndices: [],
            codeLine: 6,
            message: `arr[mid] === 1. 1 belongs in the middle section. Keep in place and increment mid to ${mid + 1}.`
          });
          mid++;
        } else {
          // val === 2, swap arr[mid] and arr[high]
          const temp = arr[mid];
          arr[mid] = arr[high];
          arr[high] = temp;

          steps.push({
            arraySnapshot: [...arr],
            low,
            mid,
            high,
            activeIndices: [mid, high],
            swappedIndices: [mid, high],
            codeLine: 8,
            message: `arr[mid] === 2. 2 belongs at the end. Swap arr[mid (${mid})] with arr[high (${high})]. Decrement high to ${high - 1}. (Keep mid at ${mid} to inspect swapped value).`
          });
          high--;
        }
      }

      steps.push({
        arraySnapshot: [...arr],
        low,
        mid,
        high,
        activeIndices: [],
        swappedIndices: [],
        codeLine: 10,
        message: `🎉 Sorted complete! All 0s placed before index ${low}, all 1s between [${low}..${high}], all 2s from index ${high + 1} onward.`
      });

      return steps;
    }
  },

  monotonic_stack: {
    id: "monotonic_stack",
    title: "Monotonic Stack (Next Greater Element)",
    tagline: "Stack of Monotonically Decreasing Indices for O(n) Lookup",
    difficulty: "Medium",
    defaultArray: [4, 5, 2, 10, 8],
    defaultTarget: 0,
    hasTarget: false,
    requiresSorted: false,
    code: [
      "function nextGreaterElement(arr) {",
      "  let res = new Array(arr.length).fill(-1);",
      "  let stack = []; // indices of decreasing elements",
      "  for (let i = 0; i < arr.length; i++) {",
      "    while (stack.length && arr[i] > arr[stack[stack.length - 1]]) {",
      "      let prevIdx = stack.pop();",
      "      res[prevIdx] = arr[i];",
      "    }",
      "    stack.push(i);",
      "  }",
      "  return res;",
      "}"
    ],
    generateSteps: (arr) => {
      const steps = [];
      const res = new Array(arr.length).fill(-1);
      const stack = [];

      steps.push({
        currIndex: -1,
        stackSnapshot: [],
        resultSnapshot: [...res],
        codeLine: 2,
        message: `Initialize empty stack to track indices and result array filled with -1.`
      });

      for (let i = 0; i < arr.length; i++) {
        steps.push({
          currIndex: i,
          stackSnapshot: [...stack],
          resultSnapshot: [...res],
          codeLine: 3,
          message: `Inspecting element arr[${i}] = ${arr[i]}. Check if it is greater than top of stack.`
        });

        while (stack.length > 0 && arr[i] > arr[stack[stack.length - 1]]) {
          const poppedIdx = stack.pop();
          res[poppedIdx] = arr[i];

          steps.push({
            currIndex: i,
            poppedIndex: poppedIdx,
            stackSnapshot: [...stack],
            resultSnapshot: [...res],
            codeLine: 5,
            message: `arr[${i}] (${arr[i]}) > arr[stack top (${poppedIdx})] (${arr[poppedIdx]}). Pop ${poppedIdx}! Next greater element for index ${poppedIdx} is ${arr[i]}.`
          });
        }

        stack.push(i);
        steps.push({
          currIndex: i,
          stackSnapshot: [...stack],
          resultSnapshot: [...res],
          codeLine: 7,
          message: `Push index ${i} (value ${arr[i]}) onto monotonic stack. Stack now: [${stack.map(idx => `${idx}:(${arr[idx]})`).join(", ")}].`
        });
      }

      steps.push({
        currIndex: -1,
        stackSnapshot: [...stack],
        resultSnapshot: [...res],
        codeLine: 9,
        message: `Traversal finished. Remaining indices in stack [${stack.join(", ")}] have no greater element to their right (default -1). Final result: [${res.join(", ")}].`
      });

      return steps;
    }
  },

  tree_traversal: {
    id: "tree_traversal",
    title: "Binary Tree BFS (Level Order)",
    tagline: "Breadth-First Exploration with Queue & Layer Processing",
    difficulty: "Medium",
    defaultArray: [1, 2, 3, 4, 5, 6, 7],
    defaultTarget: 0,
    hasTarget: false,
    requiresSorted: false,
    isTree: true,
    code: [
      "function levelOrder(root) {",
      "  if (!root) return [];",
      "  let queue = [root], res = [];",
      "  while (queue.length) {",
      "    let curr = queue.shift();",
      "    res.push(curr.val);",
      "    if (curr.left) queue.push(curr.left);",
      "    if (curr.right) queue.push(curr.right);",
      "  }",
      "  return res;",
      "}"
    ],
    generateSteps: () => {
      return [
        {
          activeNode: null,
          queue: [1],
          visited: [],
          codeLine: 2,
          message: "Initialize Queue with root node [1]. Result list is empty."
        },
        {
          activeNode: 1,
          queue: [],
          visited: [1],
          codeLine: 4,
          message: "Pop node 1 from queue. Process node 1. Check children: left=2, right=3."
        },
        {
          activeNode: 1,
          queue: [2, 3],
          visited: [1],
          codeLine: 6,
          message: "Enqueue left child (2) and right child (3). Queue now: [2, 3]."
        },
        {
          activeNode: 2,
          queue: [3],
          visited: [1, 2],
          codeLine: 4,
          message: "Pop node 2 from queue. Process node 2. Check children: left=4, right=5."
        },
        {
          activeNode: 2,
          queue: [3, 4, 5],
          visited: [1, 2],
          codeLine: 6,
          message: "Enqueue left child (4) and right child (5). Queue now: [3, 4, 5]."
        },
        {
          activeNode: 3,
          queue: [4, 5],
          visited: [1, 2, 3],
          codeLine: 4,
          message: "Pop node 3 from queue. Process node 3. Check children: left=6, right=7."
        },
        {
          activeNode: 3,
          queue: [4, 5, 6, 7],
          visited: [1, 2, 3],
          codeLine: 6,
          message: "Enqueue left child (6) and right child (7). Queue now: [4, 5, 6, 7]."
        },
        {
          activeNode: 4,
          queue: [5, 6, 7],
          visited: [1, 2, 3, 4],
          codeLine: 5,
          message: "Pop leaf node 4. No children to enqueue. Queue now: [5, 6, 7]."
        },
        {
          activeNode: 5,
          queue: [6, 7],
          visited: [1, 2, 3, 4, 5],
          codeLine: 5,
          message: "Pop leaf node 5. No children to enqueue. Queue now: [6, 7]."
        },
        {
          activeNode: 6,
          queue: [7],
          visited: [1, 2, 3, 4, 5, 6],
          codeLine: 5,
          message: "Pop leaf node 6. No children to enqueue. Queue now: [7]."
        },
        {
          activeNode: 7,
          queue: [],
          visited: [1, 2, 3, 4, 5, 6, 7],
          codeLine: 5,
          message: "Pop leaf node 7. Queue is now empty."
        },
        {
          activeNode: null,
          queue: [],
          visited: [1, 2, 3, 4, 5, 6, 7],
          codeLine: 9,
          message: "🎉 Level order traversal complete! Final visited order: [1, 2, 3, 4, 5, 6, 7]."
        }
      ];
    }
  },

  graph_bfs: {
    id: "graph_bfs",
    title: "Graph BFS (Shortest Path)",
    tagline: "Unweighted Graph Traversal & Shortest Path Discovery",
    difficulty: "Medium",
    defaultArray: [0, 1, 2, 3, 4, 5],
    defaultTarget: 5,
    targetLabel: "Target Node",
    hasTarget: false,
    requiresSorted: false,
    isGraph: true,
    code: [
      "function shortestPathBFS(graph, start, target) {",
      "  let queue = [[start, 0]], visited = new Set([start]);",
      "  while (queue.length) {",
      "    let [node, dist] = queue.shift();",
      "    if (node === target) return dist;",
      "    for (let neighbor of graph[node]) {",
      "      if (!visited.has(neighbor)) {",
      "        visited.add(neighbor);",
      "        queue.push([neighbor, dist + 1]);",
      "      }",
      "    }",
      "  }",
      "  return -1;",
      "}"
    ],
    generateSteps: () => {
      return [
        {
          currNode: "A",
          queue: [["A", 0]],
          visited: ["A"],
          shortestPath: ["A"],
          codeLine: 1,
          message: "Start BFS at node A with distance 0. Enqueue [A, 0] and mark A visited."
        },
        {
          currNode: "A",
          queue: [["B", 1], ["C", 1]],
          visited: ["A", "B", "C"],
          shortestPath: ["A"],
          codeLine: 6,
          message: "Pop A. Explore unvisited neighbors of A: B (dist 1) and C (dist 1). Add both to queue."
        },
        {
          currNode: "B",
          queue: [["C", 1], ["D", 2]],
          visited: ["A", "B", "C", "D"],
          shortestPath: ["A", "B"],
          codeLine: 6,
          message: "Pop B. Explore neighbor D (dist 2). Mark D visited and enqueue [D, 2]."
        },
        {
          currNode: "C",
          queue: [["D", 2], ["E", 2]],
          visited: ["A", "B", "C", "D", "E"],
          shortestPath: ["A", "C"],
          codeLine: 6,
          message: "Pop C. Explore neighbor E (dist 2). Mark E visited and enqueue [E, 2]."
        },
        {
          currNode: "D",
          queue: [["E", 2], ["F", 3]],
          visited: ["A", "B", "C", "D", "E", "F"],
          shortestPath: ["A", "B", "D"],
          codeLine: 6,
          message: "Pop D. Explore neighbor F (dist 3). F is the target node! Enqueue [F, 3]."
        },
        {
          currNode: "F",
          queue: [],
          visited: ["A", "B", "C", "D", "E", "F"],
          shortestPath: ["A", "B", "D", "F"],
          targetFound: true,
          codeLine: 4,
          message: "🎯 Target node F reached! Shortest path: A → B → D → F with distance = 3 edges."
        }
      ];
    }
  },

  linked_list_reversal: {
    id: "linked_list_reversal",
    title: "Linked List Reversal",
    tagline: "In-Place Pointer Inversion with 3 Pointers (O(n) time, O(1) space)",
    difficulty: "Easy",
    defaultArray: [1, 2, 3, 4, 5],
    defaultTarget: 0,
    hasTarget: false,
    requiresSorted: false,
    isLinkedList: true,
    code: [
      "function reverseList(head) {",
      "  let prev = null, curr = head;",
      "  while (curr !== null) {",
      "    let next = curr.next; // 1. scout next",
      "    curr.next = prev;     // 2. reverse pointer",
      "    prev = curr;          // 3. advance prev",
      "    curr = next;          // 4. advance curr",
      "  }",
      "  return prev; // new head",
      "}"
    ],
    generateSteps: (arr) => {
      const steps = [];
      const nodes = [...arr];
      let prevIdx = null;
      let currIdx = 0;
      let nextIdx = null;
      let reversedFlags = new Array(nodes.length).fill(false);

      steps.push({
        prevIdx: null,
        currIdx: 0,
        nextIdx: null,
        reversedFlags: [...reversedFlags],
        newHead: null,
        codeLine: 1,
        message: `Initialize pointers: prev = null, curr = Node(${nodes[0]}). List is: ${nodes.join(" → ")} → null.`
      });

      while (currIdx < nodes.length) {
        nextIdx = currIdx + 1 < nodes.length ? currIdx + 1 : null;

        // Step A: scout next
        steps.push({
          prevIdx,
          currIdx,
          nextIdx,
          reversedFlags: [...reversedFlags],
          newHead: null,
          codeLine: 3,
          message: `1. Scout ahead: next = curr.next (${nextIdx !== null ? `Node(${nodes[nextIdx]})` : "null"}). Preserve rest of list.`
        });

        // Step B: reverse link
        reversedFlags[currIdx] = true;
        steps.push({
          prevIdx,
          currIdx,
          nextIdx,
          reversedFlags: [...reversedFlags],
          newHead: null,
          codeLine: 4,
          message: `2. Invert link: curr.next = prev. Node(${nodes[currIdx]}) now points backwards to ${prevIdx !== null ? `Node(${nodes[prevIdx]})` : "null"}!`
        });

        // Step C: advance prev
        prevIdx = currIdx;
        steps.push({
          prevIdx,
          currIdx,
          nextIdx,
          reversedFlags: [...reversedFlags],
          newHead: null,
          codeLine: 5,
          message: `3. Advance prev: prev moves to curr (Node(${nodes[prevIdx]})).`
        });

        // Step D: advance curr
        currIdx = nextIdx !== null ? nextIdx : nodes.length;
        steps.push({
          prevIdx,
          currIdx: currIdx < nodes.length ? currIdx : null,
          nextIdx: null,
          reversedFlags: [...reversedFlags],
          newHead: currIdx >= nodes.length ? prevIdx : null,
          codeLine: 6,
          message: currIdx < nodes.length
            ? `4. Advance curr: curr moves to next (Node(${nodes[currIdx]})).`
            : `curr reached null! All pointers inverted.`
        });
      }

      steps.push({
        prevIdx,
        currIdx: null,
        nextIdx: null,
        reversedFlags: [...reversedFlags],
        newHead: prevIdx,
        codeLine: 8,
        message: `🎉 Inversion complete! Returning prev as new head: ${[...nodes].reverse().join(" → ")} → null.`
      });

      return steps;
    }
  },

  cycle_detection: {
    id: "cycle_detection",
    title: "Floyd's Cycle Detection",
    tagline: "Tortoise & Hare Fast/Slow Pointers for Cycle Discovery (O(n))",
    difficulty: "Medium",
    defaultArray: [1, 2, 3, 4, 5, 6],
    defaultTarget: 3,
    hasTarget: false,
    requiresSorted: false,
    isCycle: true,
    code: [
      "function detectCycle(head) {",
      "  let slow = head, fast = head;",
      "  // Phase 1: Detect Collision",
      "  while (fast && fast.next) {",
      "    slow = slow.next;",
      "    fast = fast.next.next;",
      "    if (slow === fast) break; // Collision!",
      "  }",
      "  if (!fast || !fast.next) return null;",
      "  // Phase 2: Locate Entrance",
      "  slow = head;",
      "  while (slow !== fast) {",
      "    slow = slow.next; fast = fast.next;",
      "  }",
      "  return slow; // Cycle entrance",
      "}"
    ],
    generateSteps: () => {
      return [
        {
          phase: 1,
          slow: 1,
          fast: 1,
          collision: false,
          entrance: false,
          codeLine: 1,
          message: "Initialize: slow = Node(1), fast = Node(1). Fast moves 2x as fast as slow."
        },
        {
          phase: 1,
          slow: 2,
          fast: 3,
          collision: false,
          entrance: false,
          codeLine: 4,
          message: "Iteration 1: slow moves 1 step to Node(2). fast moves 2 steps to Node(3)."
        },
        {
          phase: 1,
          slow: 3,
          fast: 5,
          collision: false,
          entrance: false,
          codeLine: 4,
          message: "Iteration 2: slow enters cycle at Node(3). fast moves 2 steps to Node(5)."
        },
        {
          phase: 1,
          slow: 4,
          fast: 3,
          collision: false,
          entrance: false,
          codeLine: 4,
          message: "Iteration 3: slow moves to Node(4). fast loops around cycle (5 → 6 → 3) to Node(3)."
        },
        {
          phase: 1,
          slow: 5,
          fast: 5,
          collision: true,
          entrance: false,
          codeLine: 6,
          message: "💥 COLLISION DETECTED! slow and fast both land on Node(5). Cycle existence confirmed in O(n) time!"
        },
        {
          phase: 2,
          slow: 1,
          fast: 5,
          collision: false,
          entrance: false,
          codeLine: 10,
          message: "Phase 2 (Locate Entrance): Reset slow = head Node(1). Keep fast at collision Node(5). Both now advance by 1 step."
        },
        {
          phase: 2,
          slow: 2,
          fast: 6,
          collision: false,
          entrance: false,
          codeLine: 12,
          message: "Phase 2 - Step 1: slow advances to Node(2). fast advances to Node(6)."
        },
        {
          phase: 2,
          slow: 3,
          fast: 3,
          collision: false,
          entrance: true,
          codeLine: 14,
          message: "🎯 CYCLE ENTRANCE FOUND! Both meet at Node(3). Mathematical guarantee: 2(d+k) = d+k+nC. Returning Node(3)."
        }
      ];
    }
  },

  bubble_sort: {
    id: "bubble_sort",
    title: "Bubble Sort",
    tagline: "Pairwise Adjacent Element Comparison & Bubbling (O(n²))",
    difficulty: "Easy",
    defaultArray: [29, 10, 14, 37, 13, 25],
    defaultTarget: 0,
    hasTarget: false,
    requiresSorted: false,
    isSorting: true,
    code: [
      "function bubbleSort(arr) {",
      "  let n = arr.length;",
      "  for (let i = 0; i < n - 1; i++) {",
      "    for (let j = 0; j < n - i - 1; j++) {",
      "      if (arr[j] > arr[j + 1]) {",
      "        swap(arr, j, j + 1);",
      "      }",
      "    }",
      "  }",
      "  return arr;",
      "}"
    ],
    generateSteps: (inputArray) => {
      const arr = [...inputArray];
      const n = arr.length;
      const steps = [];
      let comparisonsCount = 0;
      let swapsCount = 0;

      steps.push({
        arraySnapshot: [...arr],
        comparing: [],
        swapped: false,
        sortedBoundary: n,
        comparisonsCount,
        swapsCount,
        codeLine: 1,
        message: `Initialize Bubble Sort. Total elements: ${n}. Unsorted array ready.`
      });

      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          comparisonsCount++;
          const needsSwap = arr[j] > arr[j + 1];

          steps.push({
            arraySnapshot: [...arr],
            comparing: [j, j + 1],
            swapped: false,
            sortedBoundary: n - i,
            comparisonsCount,
            swapsCount,
            codeLine: 4,
            message: `Comparing arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]}). ${needsSwap ? `${arr[j]} > ${arr[j + 1]} -> Swap required!` : `${arr[j]} <= ${arr[j + 1]} -> Correct relative order.`}`
          });

          if (needsSwap) {
            swapsCount++;
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;

            steps.push({
              arraySnapshot: [...arr],
              comparing: [j, j + 1],
              swapped: true,
              sortedBoundary: n - i,
              comparisonsCount,
              swapsCount,
              codeLine: 5,
              message: `Swapped arr[${j}] and arr[${j + 1}]. Larger value (${arr[j + 1]}) bubbles rightward.`
            });
          }
        }

        steps.push({
          arraySnapshot: [...arr],
          comparing: [],
          swapped: false,
          sortedBoundary: n - 1 - i,
          comparisonsCount,
          swapsCount,
          codeLine: 3,
          message: `Pass ${i + 1} finished! Element arr[${n - 1 - i}] = ${arr[n - 1 - i]} is permanently locked into its sorted position.`
        });
      }

      steps.push({
        arraySnapshot: [...arr],
        comparing: [],
        swapped: false,
        sortedBoundary: 0,
        comparisonsCount,
        swapsCount,
        codeLine: 9,
        message: `🎉 Array sorted! Total Comparisons: ${comparisonsCount}, Total Swaps: ${swapsCount}. Result: [${arr.join(", ")}].`
      });

      return steps;
    }
  },

  queue_vs_stack: {
    id: "queue_vs_stack",
    title: "Queue (FIFO) vs Stack (LIFO)",
    tagline: "Architectural Duel: First-In-First-Out vs Last-In-First-Out",
    difficulty: "Easy",
    defaultArray: [10, 20, 30, 40],
    defaultTarget: 0,
    hasTarget: false,
    requiresSorted: false,
    isQueueStack: true,
    code: [
      "// STACK (LIFO: Last In First Out)",
      "stack.push(x);    // adds to TOP",
      "stack.pop();      // removes from TOP",
      "",
      "// QUEUE (FIFO: First In First Out)",
      "queue.enqueue(x); // adds to REAR",
      "queue.dequeue();  // removes from FRONT"
    ],
    generateSteps: () => {
      return [
        {
          stack: [],
          queue: [],
          action: "INITIALIZE",
          item: null,
          codeLine: 0,
          message: "Both structures empty. Stack (LIFO) pushes to and pops from TOP. Queue (FIFO) enqueues at REAR and dequeues at FRONT."
        },
        {
          stack: [10],
          queue: [10],
          action: "PUSH / ENQUEUE 10",
          item: 10,
          codeLine: 1,
          message: "Insert 10. Stack pushes 10 to bottom/top. Queue enqueues 10 at rear."
        },
        {
          stack: [10, 20],
          queue: [10, 20],
          action: "PUSH / ENQUEUE 20",
          item: 20,
          codeLine: 1,
          message: "Insert 20. Stack places 20 ON TOP of 10. Queue appends 20 BEHIND 10 in line."
        },
        {
          stack: [10, 20, 30],
          queue: [10, 20, 30],
          action: "PUSH / ENQUEUE 30",
          item: 30,
          codeLine: 1,
          message: "Insert 30. Stack top is 30. Queue rear is 30 (front is still 10)."
        },
        {
          stack: [10, 20, 30, 40],
          queue: [10, 20, 30, 40],
          action: "PUSH / ENQUEUE 40",
          item: 40,
          codeLine: 1,
          message: "Insert 40. Stack top is 40. Queue rear is 40. Notice the order before retrieval!"
        },
        {
          stack: [10, 20, 30],
          queue: [10, 20, 30, 40],
          action: "STACK POP -> removes 40",
          item: 40,
          codeLine: 2,
          message: "⚡ STACK POP! Removes 40 (the LAST item inserted)! Demonstrating LIFO (Last-In, First-Out). Stack top is now 30."
        },
        {
          stack: [10, 20, 30],
          queue: [20, 30, 40],
          action: "QUEUE DEQUEUE -> removes 10",
          item: 10,
          codeLine: 6,
          message: "⚡ QUEUE DEQUEUE! Removes 10 (the FIRST item inserted)! Demonstrating FIFO (First-In, First-Out). Queue front is now 20."
        },
        {
          stack: [10, 20],
          queue: [30, 40],
          action: "SECOND POP & DEQUEUE",
          item: null,
          codeLine: 2,
          message: "Second operations: Stack pops 30 (top). Queue dequeues 20 (front). Observe how the retrieval order completely diverges!"
        },
        {
          stack: [10, 20],
          queue: [30, 40],
          action: "SUMMARY",
          item: null,
          codeLine: 0,
          message: "🎯 Summary: Stack is like a stack of plates or Undo history (LIFO). Queue is like a ticket counter line or task queue (FIFO)."
        }
      ];
    }
  }
};

export default function VisualizerPage() {
  const [selectedAlgoId, setSelectedAlgoId] = useState("binary_search");
  const algoConfig = ALGORITHMS[selectedAlgoId];

  // Working state
  const [arrayInput, setArrayInput] = useState(algoConfig.defaultArray.join(", "));
  const [targetInput, setTargetInput] = useState(algoConfig.defaultTarget);
  const [parsedArray, setParsedArray] = useState([...algoConfig.defaultArray]);

  // Stepper state
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step
  const timerRef = useRef(null);

  // Initialize or recompute steps when algorithm or input changes
  const computeSteps = (arr, target) => {
    try {
      const generated = algoConfig.generateSteps(arr, Number(target));
      setSteps(generated);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } catch (e) {
      console.error("Step generation error:", e);
    }
  };

  // On algo switch
  const handleSelectAlgo = (id) => {
    const config = ALGORITHMS[id];
    setSelectedAlgoId(id);
    const newArr = [...config.defaultArray];
    const newTarget = config.defaultTarget;
    setArrayInput(newArr.join(", "));
    setTargetInput(newTarget);
    setParsedArray(newArr);

    const generated = config.generateSteps(newArr, Number(newTarget));
    setSteps(generated);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Reset or run on mount
  useEffect(() => {
    computeSteps(parsedArray, targetInput);
  }, [selectedAlgoId]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps, playbackSpeed]);

  const handleApplyCustom = () => {
    try {
      let nums = arrayInput
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));

      if (nums.length === 0) nums = [1, 2, 3, 4, 5];

      if (algoConfig.requiresSorted) {
        nums.sort((a, b) => a - b);
        setArrayInput(nums.join(", "));
      }

      setParsedArray(nums);
      computeSteps(nums, targetInput);
    } catch (err) {
      console.error("Failed to parse array", err);
    }
  };

  const handleRandomize = () => {
    const size = Math.floor(Math.random() * 6) + 6; // 6 to 11
    let nums = [];
    if (selectedAlgoId === "dutch_flag") {
      nums = Array.from({ length: size }, () => Math.floor(Math.random() * 3));
    } else {
      nums = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 5);
      if (algoConfig.requiresSorted) {
        nums.sort((a, b) => a - b);
      }
    }

    const randomTarget =
      selectedAlgoId === "sliding_window"
        ? Math.min(3, nums.length)
        : nums[Math.floor(Math.random() * nums.length)];

    setParsedArray(nums);
    setArrayInput(nums.join(", "));
    setTargetInput(randomTarget);
    computeSteps(nums, randomTarget);
  };

  const currentStep = steps[currentStepIndex] || {};

  // Maximum value for proportional bar height
  const currentArray = currentStep.arraySnapshot || parsedArray;
  const maxVal = Math.max(...currentArray, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            <Cpu className="w-4 h-4" />
            <span>Interactive Visualizer Studio</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px]">
              100% Free
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Dynamic Algorithm & Pointer Animator
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Watch pointers converge, windows slide, partitions swap, and stacks resolve in real-time. Gain visual algorithmic intuition before interviewing.
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          {Object.values(ALGORITHMS).map((algo) => (
            <button
              key={algo.id}
              onClick={() => handleSelectAlgo(algo.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedAlgoId === algo.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {algo.title.split(" (")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs & Controls Toolbar */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Custom Array Input */}
          <div className="flex-1 flex flex-wrap items-center gap-3 w-full">
            <div className="flex-1 min-w-[240px]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Input Array (Comma Separated) {algoConfig.requiresSorted && "(Auto-Sorted)"}
              </label>
              <input
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                placeholder="e.g. 2, 5, 8, 12, 16, 23"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {algoConfig.hasTarget && (
              <div className="w-36">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {algoConfig.targetLabel || "Target Value"}
                </label>
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            <div className="flex items-end gap-2 pt-4 sm:pt-0">
              <button
                onClick={handleApplyCustom}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
              >
                Apply
              </button>
              <button
                onClick={handleRandomize}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
                title="Randomize Array"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Random</span>
              </button>
            </div>
          </div>

          {/* Speed & Step Progress */}
          <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Speed:</span>
              <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 text-[11px] font-mono">
                {[
                  { label: "0.5x", val: 1800 },
                  { label: "1x", val: 1000 },
                  { label: "2x", val: 500 }
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setPlaybackSpeed(s.val)}
                    className={`px-2 py-1 rounded transition-colors ${
                      playbackSpeed === s.val
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-medium block">
                Step
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {steps.length > 0 ? currentStepIndex + 1 : 0} / {steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Playback Control Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
              }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentStepIndex === 0}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 disabled:opacity-40 transition-colors"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? "Pause" : "Auto Play"}</span>
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
              }}
              disabled={currentStepIndex >= steps.length - 1}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 disabled:opacity-40 transition-colors"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Slider */}
          <div className="flex-1 max-w-md hidden sm:block px-4">
            <input
              type="range"
              min={0}
              max={Math.max(0, steps.length - 1)}
              value={currentStepIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentStepIndex(Number(e.target.value));
              }}
              className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Intuition Tag */}
          <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{algoConfig.tagline}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Array Canvas & Dynamic Pointers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Array Canvas Container */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 relative overflow-hidden bg-slate-950/60 min-h-[380px] flex flex-col justify-between">
            {/* Pointer HUD & Legend */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                  Visual Array
                </span>
                <span className="text-[11px] text-slate-400">
                  Length: {currentArray.length}
                </span>
              </div>

              {/* Dynamic Legend based on Algo */}
              <div className="flex items-center gap-3 text-[11px]">
                {selectedAlgoId === "binary_search" && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Low
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Mid
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> High
                    </span>
                  </>
                )}

                {selectedAlgoId === "two_pointers" && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Left (L)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Right (R)
                    </span>
                  </>
                )}

                {selectedAlgoId === "sliding_window" && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Active Window
                    </span>
                  </>
                )}

                {selectedAlgoId === "dutch_flag" && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Low (0s)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Mid
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> High (2s)
                    </span>
                  </>
                )}

                {selectedAlgoId === "linked_list_reversal" && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> prev
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> curr
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> next
                    </span>
                  </>
                )}

                {selectedAlgoId === "cycle_detection" && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 🐢 slow (1x)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> 🐇 fast (2x)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Cycle Ring
                    </span>
                  </>
                )}

                {selectedAlgoId === "bubble_sort" && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Comparing
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span> Swapped
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Sorted
                    </span>
                  </>
                )}

                {selectedAlgoId === "queue_vs_stack" && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Stack (LIFO)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Queue (FIFO)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Visual Canvas (Tree, Graph, or Array) */}
            {selectedAlgoId === "tree_traversal" ? (
              <div className="py-4 flex flex-col items-center justify-center space-y-4">
                <svg viewBox="0 0 500 210" className="w-full max-w-lg h-auto">
                  {/* Tree Edges */}
                  <line x1="250" y1="35" x2="130" y2="95" stroke="#334155" strokeWidth="2" />
                  <line x1="250" y1="35" x2="370" y2="95" stroke="#334155" strokeWidth="2" />
                  <line x1="130" y1="95" x2="70" y2="165" stroke="#334155" strokeWidth="2" />
                  <line x1="130" y1="95" x2="190" y2="165" stroke="#334155" strokeWidth="2" />
                  <line x1="370" y1="95" x2="310" y2="165" stroke="#334155" strokeWidth="2" />
                  <line x1="370" y1="95" x2="430" y2="165" stroke="#334155" strokeWidth="2" />

                  {/* Nodes: [1, 2, 3, 4, 5, 6, 7] */}
                  {[
                    { id: 1, x: 250, y: 35 },
                    { id: 2, x: 130, y: 95 },
                    { id: 3, x: 370, y: 95 },
                    { id: 4, x: 70, y: 165 },
                    { id: 5, x: 190, y: 165 },
                    { id: 6, x: 310, y: 165 },
                    { id: 7, x: 430, y: 165 }
                  ].map((node) => {
                    const isActive = currentStep.activeNode === node.id;
                    const isVisited = currentStep.visited?.includes(node.id);
                    const inQueue = currentStep.queue?.includes(node.id);

                    let fill = "#0f172a";
                    let stroke = "#334155";
                    let textFill = "#94a3b8";

                    if (isActive) {
                      fill = "#f59e0b";
                      stroke = "#fbbf24";
                      textFill = "#000";
                    } else if (isVisited) {
                      fill = "#10b981";
                      stroke = "#34d399";
                      textFill = "#fff";
                    } else if (inQueue) {
                      fill = "#6366f1";
                      stroke = "#818cf8";
                      textFill = "#fff";
                    }

                    return (
                      <g key={node.id} className="transition-all duration-300">
                        <circle cx={node.x} cy={node.y} r="20" fill={fill} stroke={stroke} strokeWidth="3" />
                        <text x={node.x} y={node.y + 5} textAnchor="middle" fill={textFill} fontSize="13" fontWeight="bold" fontFamily="monospace">
                          {node.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Tree Queue / Visited HUD */}
                <div className="flex items-center justify-center gap-4 text-xs font-mono flex-wrap">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">BFS Queue:</span>
                    <span className="text-white">[{currentStep.queue?.join(", ") || "empty"}]</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">Visited (Level Order):</span>
                    <span className="text-white">[{currentStep.visited?.join(", ") || "none"}]</span>
                  </div>
                </div>
              </div>
            ) : selectedAlgoId === "graph_bfs" ? (
              <div className="py-4 flex flex-col items-center justify-center space-y-4">
                <svg viewBox="0 0 500 210" className="w-full max-w-lg h-auto">
                  {/* Graph Edges */}
                  {[
                    { x1: 80, y1: 105, x2: 200, y2: 45 },
                    { x1: 80, y1: 105, x2: 200, y2: 165 },
                    { x1: 200, y1: 45, x2: 340, y2: 45 },
                    { x1: 200, y1: 165, x2: 340, y2: 165 },
                    { x1: 340, y1: 45, x2: 440, y2: 105 },
                    { x1: 340, y1: 165, x2: 440, y2: 105 }
                  ].map((e, idx) => (
                    <line key={idx} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#334155" strokeWidth="2.5" />
                  ))}

                  {/* Vertices: A, B, C, D, E, F */}
                  {[
                    { id: "A", x: 80, y: 105 },
                    { id: "B", x: 200, y: 45 },
                    { id: "C", x: 200, y: 165 },
                    { id: "D", x: 340, y: 45 },
                    { id: "E", x: 340, y: 165 },
                    { id: "F", x: 440, y: 105 }
                  ].map((v) => {
                    const isCurr = currentStep.currNode === v.id;
                    const isVisited = currentStep.visited?.includes(v.id);
                    const inShortest = currentStep.shortestPath?.includes(v.id);

                    let fill = "#0f172a";
                    let stroke = "#334155";
                    let textFill = "#94a3b8";

                    if (isCurr) {
                      fill = "#f59e0b";
                      stroke = "#fbbf24";
                      textFill = "#000";
                    } else if (inShortest) {
                      fill = "#10b981";
                      stroke = "#34d399";
                      textFill = "#fff";
                    } else if (isVisited) {
                      fill = "#06b6d4";
                      stroke = "#22d3ee";
                      textFill = "#fff";
                    }

                    return (
                      <g key={v.id} className="transition-all duration-300">
                        <circle cx={v.x} cy={v.y} r="22" fill={fill} stroke={stroke} strokeWidth="3" />
                        <text x={v.x} y={v.y + 5} textAnchor="middle" fill={textFill} fontSize="13" fontWeight="bold" fontFamily="monospace">
                          {v.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Graph BFS HUD */}
                <div className="flex items-center justify-center gap-4 text-xs font-mono flex-wrap">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-amber-400 font-bold">Active Node:</span>
                    <span className="text-white">{currentStep.currNode || "A"}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">Visited Set:</span>
                    <span className="text-white">{`{ ${currentStep.visited?.join(", ") || "none"} }`}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">Shortest Path:</span>
                    <span className="text-emerald-300 font-bold">{currentStep.shortestPath?.join(" → ") || "none"}</span>
                  </div>
                </div>
              </div>
            ) : selectedAlgoId === "linked_list_reversal" ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-6">
                <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap px-2">
                  {currentArray.map((val, idx) => {
                    const isPrev = currentStep.prevIdx === idx;
                    const isCurr = currentStep.currIdx === idx;
                    const isNext = currentStep.nextIdx === idx;
                    const isReversed = currentStep.reversedFlags && currentStep.reversedFlags[idx];
                    const isNewHead = currentStep.newHead === idx;

                    return (
                      <div key={idx} className="flex items-center gap-2 sm:gap-3">
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Top Pointer Indicator Badges */}
                          <div className="min-h-[26px] flex items-center justify-center gap-1">
                            {isPrev && (
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                                PREV ↓
                              </span>
                            )}
                            {isCurr && (
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                                CURR ↓
                              </span>
                            )}
                            {isNext && (
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
                                NEXT ↓
                              </span>
                            )}
                          </div>

                          {/* Singly Linked Node Circle */}
                          <div
                            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300 shadow-lg ${
                              isNewHead
                                ? "bg-emerald-950 border-emerald-400 ring-4 ring-emerald-500/40 text-white scale-105"
                                : isCurr
                                ? "bg-amber-950/90 border-amber-400 ring-2 ring-amber-500/40 text-amber-200 scale-105"
                                : isPrev
                                ? "bg-emerald-950/70 border-emerald-500/70 text-emerald-200"
                                : "bg-slate-900 border-slate-700 text-slate-300"
                            }`}
                          >
                            <span className="text-[9px] text-slate-400 font-mono">val</span>
                            <span className="text-base font-bold font-mono">{val}</span>
                          </div>

                          <span className="text-[10px] text-slate-500 font-mono">[{idx}]</span>
                        </div>

                        {/* Animated Pointer Arrow */}
                        {idx < currentArray.length - 1 && (
                          <div className="flex flex-col items-center pt-2">
                            {isReversed ? (
                              <div className="flex flex-col items-center text-emerald-400 font-bold animate-pulse" title="Reversed pointer pointing backwards">
                                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                                <span className="text-[8px] uppercase font-mono tracking-tighter text-emerald-400">rev</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-slate-600" title="Forward pointer">
                                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="text-[8px] uppercase font-mono tracking-tighter text-slate-600">next</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Null Terminator */}
                  <div className="flex flex-col items-center justify-center pt-5">
                    <div className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-slate-500 shadow-inner">
                      null
                    </div>
                  </div>
                </div>

                {/* Linked List Pointer State HUD */}
                <div className="flex items-center justify-center gap-4 text-xs font-mono flex-wrap">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">prev:</span>
                    <span className="text-white">{currentStep.prevIdx !== null ? `Node(${currentArray[currentStep.prevIdx]})` : "null"}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-amber-400 font-bold">curr:</span>
                    <span className="text-white">{currentStep.currIdx !== null ? `Node(${currentArray[currentStep.currIdx]})` : "null"}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">next:</span>
                    <span className="text-white">{currentStep.nextIdx !== null ? `Node(${currentArray[currentStep.nextIdx]})` : "null"}</span>
                  </div>
                </div>
              </div>
            ) : selectedAlgoId === "cycle_detection" ? (
              <div className="py-4 flex flex-col items-center justify-center space-y-4">
                <svg viewBox="0 0 540 210" className="w-full max-w-lg h-auto">
                  {/* Straight tail edges: 1 -> 2, 2 -> 3 */}
                  <line x1="60" y1="105" x2="150" y2="105" stroke="#334155" strokeWidth="2.5" />
                  <line x1="150" y1="105" x2="240" y2="105" stroke="#334155" strokeWidth="2.5" />

                  {/* Cycle edges: 3 -> 4, 4 -> 5, 5 -> 6 */}
                  <line x1="240" y1="105" x2="340" y2="45" stroke="#6366f1" strokeWidth="2.5" />
                  <line x1="340" y1="45" x2="440" y2="105" stroke="#6366f1" strokeWidth="2.5" />
                  <line x1="440" y1="105" x2="340" y2="165" stroke="#6366f1" strokeWidth="2.5" />

                  {/* Return loop edge: 6 (340, 165) curving back into 3 (240, 105) */}
                  <path
                    d="M 340 165 C 260 185, 220 155, 240 105"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />

                  {/* Nodes: 1, 2, 3, 4, 5, 6 */}
                  {[
                    { id: 1, x: 60, y: 105, isEntrance: false },
                    { id: 2, x: 150, y: 105, isEntrance: false },
                    { id: 3, x: 240, y: 105, isEntrance: true },
                    { id: 4, x: 340, y: 45, isEntrance: false },
                    { id: 5, x: 440, y: 105, isEntrance: false },
                    { id: 6, x: 340, y: 165, isEntrance: false }
                  ].map((node) => {
                    const isSlow = currentStep.slow === node.id;
                    const isFast = currentStep.fast === node.id;
                    const isCollision = currentStep.collision && isSlow && isFast;
                    const isEntranceFound = currentStep.entrance && node.isEntrance;

                    let fill = "#0f172a";
                    let stroke = node.isEntrance ? "#6366f1" : "#334155";
                    let textFill = "#94a3b8";

                    if (isCollision) {
                      fill = "#e11d48";
                      stroke = "#fb7185";
                      textFill = "#fff";
                    } else if (isEntranceFound) {
                      fill = "#059669";
                      stroke = "#34d399";
                      textFill = "#fff";
                    } else if (isSlow && isFast) {
                      fill = "#8b5cf6";
                      stroke = "#a78bfa";
                      textFill = "#fff";
                    } else if (isSlow) {
                      fill = "#10b981";
                      stroke = "#34d399";
                      textFill = "#fff";
                    } else if (isFast) {
                      fill = "#f59e0b";
                      stroke = "#fbbf24";
                      textFill = "#000";
                    }

                    return (
                      <g key={node.id} className="transition-all duration-300">
                        <circle cx={node.x} cy={node.y} r="20" fill={fill} stroke={stroke} strokeWidth="3" />
                        <text x={node.x} y={node.y + 5} textAnchor="middle" fill={textFill} fontSize="12" fontWeight="bold" fontFamily="monospace">
                          {node.id}
                        </text>
                        {node.isEntrance && (
                          <text x={node.x} y={node.y - 26} textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="bold">
                            Entrance
                          </text>
                        )}
                        {/* Pointer markers */}
                        {isSlow && (
                          <text x={node.x - 16} y={node.y + 34} fill="#34d399" fontSize="10" fontWeight="bold">
                            🐢 slow
                          </text>
                        )}
                        {isFast && (
                          <text x={node.x + (isSlow ? 6 : -14)} y={node.y + 34} fill="#fbbf24" fontSize="10" fontWeight="bold">
                            🐇 fast
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Cycle Detection HUD */}
                <div className="flex items-center justify-center gap-4 text-xs font-mono flex-wrap">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">🐢 Slow Pointer:</span>
                    <span className="text-white">Node({currentStep.slow}) (1x speed)</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-amber-400 font-bold">🐇 Fast Pointer:</span>
                    <span className="text-white">Node({currentStep.fast}) (2x speed)</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">Phase:</span>
                    <span className="text-indigo-300">{currentStep.phase === 1 ? "1. Detect Collision" : "2. Locate Cycle Entrance"}</span>
                  </div>
                </div>
              </div>
            ) : selectedAlgoId === "bubble_sort" ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-6">
                {/* Bubble Sort Metric Counters */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-amber-400 font-bold">Comparisons:</span>
                    <span className="text-white">{currentStep.comparisonsCount ?? 0}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <span className="text-pink-400 font-bold">Swaps:</span>
                    <span className="text-white">{currentStep.swapsCount ?? 0}</span>
                  </div>
                </div>

                {/* Animated Bars */}
                <div className="flex items-end justify-center gap-2 sm:gap-3 py-4 w-full overflow-x-auto">
                  {currentArray.map((val, idx) => {
                    const isComparing = currentStep.comparing?.includes(idx);
                    const isSwapped = isComparing && currentStep.swapped;
                    const isSorted = idx >= (currentStep.sortedBoundary ?? currentArray.length);

                    const barHeight = Math.max(32, Math.min(140, (val / maxVal) * 130));

                    let borderClass = "border-slate-800";
                    let bgClass = "bg-slate-900";
                    let textClass = "text-white";

                    if (isSwapped) {
                      borderClass = "border-pink-500 ring-2 ring-pink-500/50";
                      bgClass = "bg-pink-950/80";
                      textClass = "text-pink-300 font-bold";
                    } else if (isComparing) {
                      borderClass = "border-amber-500 ring-2 ring-amber-500/40";
                      bgClass = "bg-amber-950/70";
                      textClass = "text-amber-300 font-bold";
                    } else if (isSorted) {
                      borderClass = "border-emerald-500 ring-1 ring-emerald-500/40";
                      bgClass = "bg-emerald-950/60";
                      textClass = "text-emerald-300 font-bold";
                    }

                    return (
                      <div key={idx} className="w-12 sm:w-14 flex flex-col items-center gap-1 transition-all duration-300">
                        {isComparing && (
                          <span className="text-[9px] font-mono font-bold text-amber-400 animate-pulse">
                            {isSwapped ? "SWAP!" : "CMP"}
                          </span>
                        )}
                        {isSorted && !isComparing && (
                          <span className="text-[9px] font-mono font-bold text-emerald-400">
                            ✓
                          </span>
                        )}

                        <div
                          style={{ height: `${barHeight}px` }}
                          className={`w-full rounded-t-xl border-t border-x ${borderClass} ${bgClass} flex items-center justify-center transition-all shadow-inner`}
                        >
                          <span className={`text-base font-mono font-extrabold ${textClass}`}>
                            {val}
                          </span>
                        </div>

                        <div className="w-full py-1 bg-slate-950 border-x border-b border-slate-800 rounded-b-xl text-center">
                          <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : selectedAlgoId === "queue_vs_stack" ? (
              <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Stack Card */}
                <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-slate-950/60 flex flex-col items-center justify-between min-h-[260px]">
                  <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      Stack (LIFO)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Last-In, First-Out</span>
                  </div>

                  {/* Stack Vertical Beaker */}
                  <div className="w-32 border-2 border-indigo-500/40 border-t-0 rounded-b-2xl p-2.5 flex flex-col-reverse gap-1.5 min-h-[140px] bg-indigo-950/20 shadow-inner my-2">
                    {currentStep.stack?.length === 0 ? (
                      <div className="text-slate-600 text-xs text-center my-auto italic">[ Empty ]</div>
                    ) : (
                      currentStep.stack?.map((val, idx) => (
                        <div
                          key={idx}
                          className={`w-full py-1.5 rounded-lg text-center font-mono font-bold text-xs border transition-all ${
                            idx === currentStep.stack.length - 1
                              ? "bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-500/50 shadow-md animate-pulse"
                              : "bg-slate-900 text-slate-300 border-slate-800"
                          }`}
                        >
                          {val} {idx === currentStep.stack.length - 1 && "← TOP"}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono text-center">
                    Push to top • Pop from top
                  </div>
                </div>

                {/* Queue Card */}
                <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-slate-950/60 flex flex-col items-center justify-between min-h-[260px]">
                  <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Repeat className="w-4 h-4" />
                      Queue (FIFO)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">First-In, First-Out</span>
                  </div>

                  {/* Queue Horizontal Pipe */}
                  <div className="w-full max-w-xs flex items-center justify-center gap-2 border-y-2 border-emerald-500/40 py-4 px-2 min-h-[100px] bg-emerald-950/20 shadow-inner overflow-x-auto my-auto">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">Front →</span>
                    {currentStep.queue?.length === 0 ? (
                      <div className="text-slate-600 text-xs text-center italic">[ Empty ]</div>
                    ) : (
                      currentStep.queue?.map((val, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-1.5 rounded-lg text-center font-mono font-bold text-xs border shrink-0 transition-all ${
                            idx === 0
                              ? "bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-500/50 shadow-md animate-pulse"
                              : "bg-slate-900 text-slate-300 border-slate-800"
                          }`}
                        >
                          {val} {idx === 0 && "(Head)"}
                        </div>
                      ))
                    )}
                    <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold">→ Rear</span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono text-center">
                    Enqueue to rear • Dequeue from front
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Pointer Arrows Row (Top) */}
                <div className="flex items-end justify-center gap-2 sm:gap-3 pt-6 pb-2 min-h-[50px] overflow-x-auto">
                  {currentArray.map((_, idx) => {
                    const pointers = [];
                    if (selectedAlgoId === "binary_search") {
                      if (currentStep.low === idx) pointers.push({ label: "LOW", color: "text-cyan-400 border-cyan-500/50 bg-cyan-950/60" });
                      if (currentStep.mid === idx) pointers.push({ label: "MID", color: "text-amber-400 border-amber-500/50 bg-amber-950/60" });
                      if (currentStep.high === idx) pointers.push({ label: "HIGH", color: "text-purple-400 border-purple-500/50 bg-purple-950/60" });
                    } else if (selectedAlgoId === "two_pointers") {
                      if (currentStep.left === idx) pointers.push({ label: "L", color: "text-cyan-400 border-cyan-500/50 bg-cyan-950/60" });
                      if (currentStep.right === idx) pointers.push({ label: "R", color: "text-rose-400 border-rose-500/50 bg-rose-950/60" });
                    } else if (selectedAlgoId === "dutch_flag") {
                      if (currentStep.low === idx) pointers.push({ label: "LOW", color: "text-cyan-400 border-cyan-500/50 bg-cyan-950/60" });
                      if (currentStep.mid === idx) pointers.push({ label: "MID", color: "text-amber-400 border-amber-500/50 bg-amber-950/60" });
                      if (currentStep.high === idx) pointers.push({ label: "HIGH", color: "text-purple-400 border-purple-500/50 bg-purple-950/60" });
                    } else if (selectedAlgoId === "monotonic_stack") {
                      if (currentStep.currIndex === idx) pointers.push({ label: "CURR", color: "text-amber-400 border-amber-500/50 bg-amber-950/60" });
                    }

                    return (
                      <div key={idx} className="w-12 sm:w-14 flex flex-col items-center justify-end gap-1">
                        {pointers.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${p.color} animate-pulse`}
                          >
                            {p.label} ↓
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* The Animated Array Elements Row */}
                <div className="flex items-end justify-center gap-2 sm:gap-3 py-6 overflow-x-auto">
                  {currentArray.map((val, idx) => {
                    const isDiscarded = currentStep.discardedIndices?.includes(idx);
                    const isFound =
                      currentStep.foundIndex === idx ||
                      currentStep.foundIndices?.includes(idx);
                    const isActive =
                      currentStep.activeIndices?.includes(idx) ||
                      currentStep.mid === idx ||
                      currentStep.left === idx ||
                      currentStep.right === idx;
                    const isSwapped = currentStep.swappedIndices?.includes(idx);

                    const inWindow =
                      selectedAlgoId === "sliding_window" &&
                      idx >= currentStep.windowStart &&
                      idx <= currentStep.windowEnd;

                    let borderClass = "border-slate-800";
                    let bgClass = "bg-slate-900";
                    let textClass = "text-white";

                    if (isFound) {
                      borderClass = "border-emerald-500 ring-2 ring-emerald-500/50";
                      bgClass = "bg-emerald-950/80";
                      textClass = "text-emerald-300 font-bold";
                    } else if (isSwapped) {
                      borderClass = "border-pink-500 ring-2 ring-pink-500/50";
                      bgClass = "bg-pink-950/70";
                      textClass = "text-pink-300";
                    } else if (inWindow) {
                      borderClass = "border-emerald-400 ring-1 ring-emerald-400/40";
                      bgClass = "bg-emerald-950/40";
                      textClass = "text-emerald-200 font-bold";
                    } else if (isActive) {
                      borderClass = "border-indigo-500 ring-2 ring-indigo-500/40";
                      bgClass = "bg-indigo-950/80";
                      textClass = "text-indigo-200 font-bold";
                    } else if (isDiscarded) {
                      borderClass = "border-slate-800/40";
                      bgClass = "bg-slate-950/40";
                      textClass = "text-slate-600 line-through";
                    }

                    const barHeight = Math.max(28, Math.min(120, (val / maxVal) * 110));

                    return (
                      <div
                        key={idx}
                        className={`w-12 sm:w-14 flex flex-col items-center transition-all duration-300 ${
                          isDiscarded ? "opacity-30 scale-95" : "scale-100"
                        }`}
                      >
                        <div
                          style={{ height: `${barHeight}px` }}
                          className={`w-full rounded-t-xl border-t border-x ${borderClass} ${bgClass} flex items-center justify-center transition-all shadow-inner`}
                        >
                          <span className={`text-base sm:text-lg font-mono font-extrabold ${textClass}`}>
                            {val}
                          </span>
                        </div>

                        <div className="w-full py-1 bg-slate-950 border-x border-b border-slate-800 rounded-b-xl text-center">
                          <span className="text-[10px] font-mono text-slate-400">
                            [{idx}]
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Bottom State Inspector Bar */}
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-slate-300">Live State:</span>
                {selectedAlgoId === "binary_search" && (
                  <span className="font-mono text-slate-300">
                    low: <strong className="text-cyan-400">{currentStep.low ?? "-"}</strong> |{" "}
                    mid: <strong className="text-amber-400">{currentStep.mid !== -1 ? currentStep.mid : "-"}</strong> |{" "}
                    high: <strong className="text-purple-400">{currentStep.high ?? "-"}</strong>
                  </span>
                )}
                {selectedAlgoId === "two_pointers" && (
                  <span className="font-mono text-slate-300">
                    L: <strong className="text-cyan-400">{currentStep.left ?? "-"}</strong> |{" "}
                    R: <strong className="text-rose-400">{currentStep.right ?? "-"}</strong> |{" "}
                    Sum: <strong className="text-emerald-400">{currentStep.currentSum ?? "-"}</strong>
                  </span>
                )}
                {selectedAlgoId === "sliding_window" && (
                  <span className="font-mono text-slate-300">
                    Window: <strong className="text-emerald-400">[{currentStep.windowStart}..{currentStep.windowEnd}]</strong> |{" "}
                    Window Sum: <strong className="text-amber-400">{currentStep.windowSum ?? 0}</strong> |{" "}
                    Max Sum: <strong className="text-emerald-400">{currentStep.maxSum ?? 0}</strong>
                  </span>
                )}
                {selectedAlgoId === "dutch_flag" && (
                  <span className="font-mono text-slate-300">
                    low: <strong className="text-cyan-400">{currentStep.low}</strong> |{" "}
                    mid: <strong className="text-amber-400">{currentStep.mid}</strong> |{" "}
                    high: <strong className="text-purple-400">{currentStep.high}</strong>
                  </span>
                )}
                {selectedAlgoId === "monotonic_stack" && (
                  <span className="font-mono text-slate-300">
                    Active Stack: <strong className="text-indigo-400">[{currentStep.stackSnapshot?.join(", ")}]</strong>
                  </span>
                )}
                {selectedAlgoId === "tree_traversal" && (
                  <span className="font-mono text-slate-300">
                    Active Node: <strong className="text-amber-400">{currentStep.activeNode ?? "None"}</strong> |{" "}
                    Queue Size: <strong className="text-indigo-400">{currentStep.queue?.length ?? 0}</strong>
                  </span>
                )}
                {selectedAlgoId === "graph_bfs" && (
                  <span className="font-mono text-slate-300">
                    Active Node: <strong className="text-amber-400">{currentStep.currNode ?? "A"}</strong> |{" "}
                    Visited Count: <strong className="text-cyan-400">{currentStep.visited?.length ?? 0}</strong>
                  </span>
                )}
                {selectedAlgoId === "linked_list_reversal" && (
                  <span className="font-mono text-slate-300">
                    prev: <strong className="text-emerald-400">{currentStep.prevIdx !== null ? `[${currentStep.prevIdx}]` : "null"}</strong> |{" "}
                    curr: <strong className="text-amber-400">{currentStep.currIdx !== null ? `[${currentStep.currIdx}]` : "null"}</strong> |{" "}
                    next: <strong className="text-cyan-400">{currentStep.nextIdx !== null ? `[${currentStep.nextIdx}]` : "null"}</strong>
                  </span>
                )}
                {selectedAlgoId === "cycle_detection" && (
                  <span className="font-mono text-slate-300">
                    slow: <strong className="text-emerald-400">Node({currentStep.slow})</strong> |{" "}
                    fast: <strong className="text-amber-400">Node({currentStep.fast})</strong> |{" "}
                    Phase: <strong className="text-indigo-400">{currentStep.phase || 1}</strong>
                  </span>
                )}
                {selectedAlgoId === "bubble_sort" && (
                  <span className="font-mono text-slate-300">
                    Comparisons: <strong className="text-amber-400">{currentStep.comparisonsCount ?? 0}</strong> |{" "}
                    Swaps: <strong className="text-pink-400">{currentStep.swapsCount ?? 0}</strong>
                  </span>
                )}
                {selectedAlgoId === "queue_vs_stack" && (
                  <span className="font-mono text-slate-300">
                    Stack Size: <strong className="text-indigo-400">{currentStep.stack?.length ?? 0}</strong> |{" "}
                    Queue Size: <strong className="text-emerald-400">{currentStep.queue?.length ?? 0}</strong> |{" "}
                    Op: <strong className="text-amber-400">{currentStep.action || "Init"}</strong>
                  </span>
                )}
              </div>

              {currentStep.comparison && (
                <div className="px-2.5 py-1 rounded-md bg-slate-950 font-mono text-[11px] text-indigo-300 border border-slate-800">
                  Condition: {currentStep.comparison}
                </div>
              )}
            </div>
          </div>

          {/* Monotonic Stack Auxiliary Container (When in Monotonic Stack Mode) */}
          {selectedAlgoId === "monotonic_stack" && (
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Stack Memory Visualizer
                </span>
                <span className="text-slate-400 text-[11px]">
                  Stores indices in monotonic decreasing order
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visual Stack Box */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-end min-h-[140px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Stack Top (LIFO)
                  </span>
                  <div className="flex flex-col-reverse gap-1.5">
                    {currentStep.stackSnapshot?.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-600 italic">
                        [ Stack is Empty ]
                      </div>
                    ) : (
                      currentStep.stackSnapshot?.map((stIdx, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-xs font-mono flex items-center justify-between text-indigo-200"
                        >
                          <span>Index: {stIdx}</span>
                          <span className="font-bold text-white">Value: {parsedArray[stIdx]}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Result Array Box */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Next Greater Element Output Array
                  </span>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {currentStep.resultSnapshot?.map((rVal, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-xl text-xs font-mono flex flex-col items-center border ${
                          rVal !== -1
                            ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="text-[9px] text-slate-500">arr[{idx}]</span>
                        <span className="text-sm font-bold">{rVal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Step Explanation Box */}
          <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-slate-900 to-slate-900 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                Step {currentStepIndex + 1} Intuition & Logic
              </span>
              <span className="text-slate-500 text-[11px] font-mono">
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {currentStep.message || "Press Play or Next Step to begin the dry-run simulation."}
            </p>
          </div>
        </div>

        {/* Right Col: Synchronized Code Pane & Key Takeaways */}
        <div className="space-y-6">
          {/* Synchronized Code Box */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Algorithm Implementation
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                JavaScript
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 font-mono text-xs overflow-x-auto border border-slate-900 leading-6">
              {algoConfig.code.map((line, lineIdx) => {
                const isHighlight = currentStep.codeLine === lineIdx;
                return (
                  <div
                    key={lineIdx}
                    className={`px-2 rounded transition-colors flex items-center gap-3 ${
                      isHighlight
                        ? "bg-indigo-950/90 text-indigo-200 border-l-2 border-indigo-400 font-bold"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <span className="w-4 text-right text-[10px] text-slate-600 select-none">
                      {lineIdx + 1}
                    </span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interview Pattern Quick Card */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Interview Mental Model</span>
            </div>

            <div className="text-xs text-slate-300 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-semibold text-emerald-400 block mb-0.5">
                  When to apply this pattern:
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {selectedAlgoId === "binary_search" && "Array is sorted (or monotonic condition), and you need O(log n) time instead of linear search."}
                  {selectedAlgoId === "two_pointers" && "Sorted arrays, pair sum problems, palindrome checks, or reversing intervals without extra memory."}
                  {selectedAlgoId === "sliding_window" && "Contiguous subarrays, fixed or variable window size, computing running maximums or substrings."}
                  {selectedAlgoId === "dutch_flag" && "Partitioning an array into 3 discrete sets (e.g. 0s, 1s, 2s or < pivot, == pivot, > pivot)."}
                  {selectedAlgoId === "monotonic_stack" && "Finding Next Greater Element, Previous Greater Element, or Largest Rectangle in Histogram in O(n)."}
                  {selectedAlgoId === "tree_traversal" && "Level-order BFS traversal, finding shortest distance in unweighted trees, or printing by depth."}
                  {selectedAlgoId === "graph_bfs" && "Shortest path in unweighted graphs, connected components, or level-by-level network expansion."}
                  {selectedAlgoId === "linked_list_reversal" && "Reversing singly linked list in-place, checking palindrome linked lists, or k-group reversals."}
                  {selectedAlgoId === "cycle_detection" && "Loop detection in linked lists, state machines, or finding duplicate numbers with O(1) extra space."}
                  {selectedAlgoId === "bubble_sort" && "Educational comparisons, nearly sorted arrays (early exit O(n)), and stable in-place sorting."}
                  {selectedAlgoId === "queue_vs_stack" && "Choosing LIFO (DFS, Undo/Redo, Syntax parsing) vs FIFO (BFS, Task schedulers, Buffering)."}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-semibold text-indigo-400 block mb-0.5">
                  Time & Space Complexity:
                </span>
                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300">
                  <span>
                    Time:{" "}
                    <strong className="text-emerald-400">
                      {selectedAlgoId === "binary_search"
                        ? "O(log n)"
                        : selectedAlgoId === "bubble_sort"
                        ? "O(n²)"
                        : selectedAlgoId === "queue_vs_stack"
                        ? "O(1) / op"
                        : "O(n)"}
                    </strong>
                  </span>
                  <span>
                    Space:{" "}
                    <strong className="text-emerald-400">
                      {selectedAlgoId === "monotonic_stack" || selectedAlgoId === "tree_traversal" || selectedAlgoId === "graph_bfs" || selectedAlgoId === "queue_vs_stack"
                        ? "O(n)"
                        : "O(1)"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
