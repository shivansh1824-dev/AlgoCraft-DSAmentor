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
      "code": "// Full implementation in requested language",
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
      "code": "// Implementation",
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
      "code": "// Optimal clean production code",
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
  ]
}

Ensure all code is syntactically complete, strictly in the requested target language, and well-commented.
Do NOT include any markdown code blocks (such as \`\`\`json). Return raw JSON only.`;

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
      const userPrompt = `
Problem: ${problemData.name}
Platform: ${problemData.platform} ${problemData.url ? `(${problemData.url})` : ""}
Topic: ${problemData.topic}
Difficulty: ${problemData.difficulty}
Target Programming Language: ${problemData.language}
User's Current Stuck Point / Question: ${problemData.stuckPoint || "Looking for optimal breakdown"}
Requested Depth: ${depth}
Requested Mode: ${mode}
`;

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
