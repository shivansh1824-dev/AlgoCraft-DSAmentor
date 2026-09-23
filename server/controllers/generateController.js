import { Solution, inMemorySolutions } from "../models/solutionModel.js";
import { User } from "../models/userModel.js";
import { generateGeminiContent } from "../services/geminiService.js";
import { buildFallbackSolution } from "../services/fallbackEngine.js";

const SYSTEM_PROMPT = `You are AlgoCraft, the world's most articulate and pedagogical AI Data Structures & Algorithms (DSA) Mentor.
Your mission is not just to provide code, but to TEACH engineers how to identify patterns, build intuition, and succeed in FAANG-level technical interviews.

You must return ONLY valid, raw JSON matching this exact schema:
{
  "intuition": "Deep mental model and conceptual breakdown of the problem. Explain the core aha-moment.",
  "approaches": [
    {
      "level": "Brute Force",
      "name": "Approach Name",
      "intuition": "Why this naive approach works and its fundamental flaw",
      "stepByStep": ["Step 1", "Step 2", "Step 3"],
      "code": "REAL COMPILABLE CODE — see rules below",
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "complexityReason": "Detailed mathematical justification",
      "tradeOffs": "Pros and cons",
      "codeExplanation": "Walkthrough of critical code lines"
    },
    {
      "level": "Better",
      "name": "Approach Name",
      "intuition": "How we improve upon brute force",
      "stepByStep": ["Step 1", "Step 2"],
      "code": "REAL COMPILABLE CODE",
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "complexityReason": "Why runtime dropped",
      "tradeOffs": "Pros and cons",
      "codeExplanation": "Key technique explanation"
    },
    {
      "level": "Optimal",
      "name": "Approach Name",
      "intuition": "The optimal algorithmic breakthrough",
      "stepByStep": ["Step 1", "Step 2", "Step 3"],
      "code": "REAL COMPILABLE CODE",
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "complexityReason": "Proof of optimality",
      "tradeOffs": "Memory vs time considerations",
      "codeExplanation": "Line by line pedagogical commentary"
    }
  ],
  "dryRun": {
    "inputExample": "Concrete test case",
    "traceSteps": [
      { "step": 1, "variables": "var1 = x, var2 = y", "state": "State description", "explanation": "What happened" }
    ],
    "output": "Result"
  },
  "edgeCases": [
    "Edge case 1 description",
    "Edge case 2 description"
  ],
  "commonMistakes": [
    "Mistake 1 description",
    "Mistake 2 description"
  ],
  "interviewTips": [
    "Tip 1 for discussing with interviewer",
    "Tip 2"
  ],
  "platformTemplate": {
    "cpp": "exact C++ LeetCode starter template with correct function name, return type, and params for THIS problem",
    "java": "exact Java LeetCode starter template with correct function name, return type, and params for THIS problem",
    "python": "exact Python LeetCode starter template with correct function name, return type, and params for THIS problem"
  }
}

=== CRITICAL CODE GENERATION RULES — MANDATORY ===

RULE 1 — NO PSEUDOCODE EVER:
Every "code" field MUST be real, syntactically correct, compilable source code.
NEVER write pseudocode or skeleton placeholders like "// check condition", "// do something", or empty loop bodies.
Every function body must contain a COMPLETE, WORKING implementation.

RULE 2 — C++ FORMAT (when Target Language is C++):
- Include all required headers: #include <vector>, #include <string>, #include <unordered_map>, #include <algorithm>, etc.
- Add: using namespace std;
- Wrap in: class Solution { public: ... };
- All methods are public member functions with correct LeetCode signature.
- Example for "Two Sum":
    #include <vector>
    #include <unordered_map>
    using namespace std;
    class Solution {
    public:
        vector<int> twoSum(vector<int>& nums, int target) {
            unordered_map<int,int> seen;
            for (int i = 0; i < (int)nums.size(); i++) {
                int comp = target - nums[i];
                if (seen.count(comp)) return {seen[comp], i};
                seen[nums[i]] = i;
            }
            return {};
        }
    };

RULE 3 — Java FORMAT (when Target Language is Java):
- Add import java.util.*; at the top when collections are needed.
- Wrap in: class Solution { public returnType methodName(params) { ... } }
- Use correct Java types: int[], List<Integer>, Map<Integer,Integer>, String, etc.

RULE 4 — Python FORMAT (when Target Language is Python):
- Add from typing import List, Dict, Optional, Tuple as needed.
- Wrap in: class Solution: followed by def with type hints.
- Example: def twoSum(self, nums: List[int], target: int) -> List[int]:
- Use Pythonic code: dict, enumerate, zip, comprehensions, etc.

RULE 5 — JavaScript FORMAT (when Target Language is JavaScript):
- Use ES6+: const, let, arrow functions, Map, Set, destructuring.
- LeetCode format: var methodName = function(params) { ... };

RULE 6 — C FORMAT (when Target Language is C):
- #include <stdio.h>, #include <stdlib.h>, #include <string.h>
- Plain C function with pointer parameters as LeetCode expects.

RULE 7 — platformTemplate:
- MUST contain the ACTUAL, SPECIFIC function signature for THIS problem on the target platform (not a generic placeholder).
- Infer the exact function name, return type, and parameter types from the problem name, topic, and platform convention.
- The template has the class + signature pre-filled with an empty body (or simple return stub).
- The programmer will copy this directly into LeetCode or GeeksforGeeks and complete the body.

RULE 8 — PLATFORM-SPECIFIC SIGNATURES & READY-TO-SUBMIT CODE:
- Identify the target platform (LeetCode, GeeksforGeeks, HackerRank, etc.).
- For LeetCode:
  * In C++: Wrap in class Solution { public: <returnType> <methodName>(<params>) { ... } };
  * In Java: Wrap in class Solution { public <returnType> <methodName>(<params>) { ... } }
  * In Python: Wrap in class Solution: def <methodName>(self, <params>) -> <returnType>: ...
  * Use standard LeetCode parameter conventions (e.g. nums, target, head, root, s, matrix).
- For GeeksforGeeks:
  * In C++: Wrap in class Solution { public: <returnType> <methodName>(<params>) { ... } };
  * In Java: Wrap in class Solution { public <returnType> <methodName>(<params>) { ... } }
  * In Python: Wrap in class Solution: def <methodName>(self, <params>): ...
  * Use standard GFG parameter conventions (e.g. arr, n, target, head, root).
- ALL 3 APPROACHES (Brute Force, Better, Optimal) MUST BE 100% SUBMIT-READY on the platform:
  * NEVER use main() or print statements (cout, System.out.println, print) for the answer.
  * Every approach MUST execute the logic and return the computed value matching the method's return type.
  * Include necessary headers/imports at the top so the file is self-contained.

Do NOT include any markdown code blocks (such as \`\`\`json). Return raw JSON only.`;

/**
 * Strengthen the user prompt to reinforce language-specific real code requirement
 */
const buildUserPrompt = (problemData, depth, mode) => {
  const langMap = {
    "C++": "C++ (with #include headers, using namespace std, class Solution wrapper)",
    "Java": "Java (with import java.util.*, class Solution wrapper)",
    "Python": "Python (with from typing import List/Dict/etc., class Solution wrapper)",
    "JavaScript": "JavaScript (ES6+, var methodName = function(...) {} LeetCode format)",
    "TypeScript": "TypeScript (with proper type annotations, LeetCode class format)",
    "C": "C (with #include <stdlib.h>, plain functions with pointer params)"
  };

  const langFull = langMap[problemData.language] || problemData.language;

  return `Problem: ${problemData.name}
Platform: ${problemData.platform} ${problemData.url ? `(${problemData.url})` : ""}
Topic: ${problemData.topic}
Difficulty: ${problemData.difficulty}
Target Programming Language: ${langFull}
User's Current Stuck Point / Question: ${problemData.stuckPoint || "Looking for complete optimal breakdown"}
Requested Depth: ${depth}
Requested Mode: ${mode}

CRITICAL INSTRUCTIONS:
1. Generate REAL, COMPILABLE ${problemData.language} code matching the exact function signature and input parameters required for submission on ${problemData.platform}.
2. All 3 approaches (Brute Force, Better, Optimal) must be valid, fully implemented, and ready to submit on ${problemData.platform} (return the computed result directly).
3. The "platformTemplate" must have the exact ${problemData.platform} class and method boilerplate for "${problemData.name}".`;
};

/**
 * Generate a comprehensive DSA solution breakdown
 */
export const generateSolution = async (req, res) => {
  try {
    const {
      name,
      platform = "LeetCode",
      url = "",
      topic = "Algorithms",
      difficulty = "Medium",
      language = "C++",
      stuckPoint = "",
      mode = "multipleApproaches",
      depth = "detailed"
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Problem name is required." });
    }

    const problemData = {
      name: name.trim(),
      platform,
      url,
      topic,
      difficulty,
      language,
      stuckPoint
    };

    let content = null;
    let usedFallback = false;

    // 1. Try Gemini API
    try {
      const userPrompt = buildUserPrompt(problemData, depth, mode);
      content = await generateGeminiContent(SYSTEM_PROMPT, userPrompt);
    } catch (aiError) {
      console.warn("⚠️ Gemini API unavailable, generating with intelligent fallback engine:", aiError.message);
      content = buildFallbackSolution(problemData);
      usedFallback = true;
    }

    // Ensure approaches have proper structure
    if (!content || !Array.isArray(content.approaches) || content.approaches.length === 0) {
      content = buildFallbackSolution(problemData);
      usedFallback = true;
    }

    // 2. Persist Solution
    const solutionId = "sol_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const newSolution = {
      _id: solutionId,
      userId: req.body.userId || "guest_user",
      problem: problemData,
      settings: { mode, depth },
      content,
      status: "completed",
      bookmarked: false,
      notes: "",
      createdAt: new Date()
    };

    // Save in-memory
    inMemorySolutions.set(solutionId, newSolution);

    // Save to MongoDB if connected
    try {
      const dbDoc = new Solution({
        ...newSolution,
        _id: undefined // let Mongo generate or use default
      });
      await dbDoc.save();
      newSolution._id = dbDoc._id.toString();
    } catch (dbErr) {
      // MongoDB not connected or in fallback mode
    }

    // 3. Update User Solved Stats
    try {
      const user = await User.findOne({ uid: newSolution.userId });
      if (user) {
        user.problemsSolved += 1;
        user.lastActiveDate = new Date();
        await user.save();
      }
    } catch (userErr) {
      // ignore user save errors in offline mode
    }

    return res.status(201).json({
      success: true,
      solution: newSolution,
      fallback: usedFallback
    });
  } catch (error) {
    console.error("🔴 Solution generation error:", error);
    return res.status(500).json({
      error: "Failed to generate solution breakdown.",
      details: error.message
    });
  }
};

/**
 * Get all solved problems (with filtering & search)
 */
export const getSolutions = async (req, res) => {
  try {
    const { search = "", topic = "", difficulty = "", platform = "", bookmarked } = req.query;

    let solutions = [];
    try {
      const query = {};
      if (topic) query["problem.topic"] = topic;
      if (difficulty) query["problem.difficulty"] = difficulty;
      if (platform) query["problem.platform"] = platform;
      if (bookmarked === "true") query.bookmarked = true;
      if (search) query["problem.name"] = { $regex: search, $options: "i" };

      solutions = await Solution.find(query).sort({ createdAt: -1 }).limit(50).lean();
    } catch (err) {
      // fallback to inMemorySolutions
      solutions = Array.from(inMemorySolutions.values());
    }

    if (solutions.length === 0 && inMemorySolutions.size > 0) {
      solutions = Array.from(inMemorySolutions.values());
    }

    // In-memory filter if needed
    if (search) {
      solutions = solutions.filter(s =>
        s.problem?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return res.json({ success: true, count: solutions.length, solutions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get single solution by ID
 */
export const getSolutionById = async (req, res) => {
  try {
    const { id } = req.params;

    // check memory first
    if (inMemorySolutions.has(id)) {
      return res.json({ success: true, solution: inMemorySolutions.get(id) });
    }

    try {
      const doc = await Solution.findById(id).lean();
      if (doc) return res.json({ success: true, solution: doc });
    } catch (err) {
      // not found in Mongo
    }

    return res.status(404).json({ error: "Solution not found." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Toggle bookmark status
 */
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;

    if (inMemorySolutions.has(id)) {
      const sol = inMemorySolutions.get(id);
      sol.bookmarked = !sol.bookmarked;
      return res.json({ success: true, bookmarked: sol.bookmarked });
    }

    const doc = await Solution.findById(id);
    if (!doc) return res.status(404).json({ error: "Solution not found." });

    doc.bookmarked = !doc.bookmarked;
    await doc.save();

    return res.json({ success: true, bookmarked: doc.bookmarked });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Save notes for a solution
 */
export const saveNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (inMemorySolutions.has(id)) {
      const sol = inMemorySolutions.get(id);
      sol.notes = notes;
      return res.json({ success: true, notes: sol.notes });
    }

    const doc = await Solution.findById(id);
    if (!doc) return res.status(404).json({ error: "Solution not found." });

    doc.notes = notes;
    await doc.save();

    return res.json({ success: true, notes: doc.notes });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
