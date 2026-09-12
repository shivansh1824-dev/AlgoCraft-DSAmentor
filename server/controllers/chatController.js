import { generateGeminiContent } from "../services/geminiService.js";
import { inMemorySolutions, Solution } from "../models/solutionModel.js";

const chatHistoryMap = new Map();

/**
 * AI Mentor Chat anchored to a problem solution
 */
export const handleMentorChat = async (req, res) => {
  try {
    const { solutionId, message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    // 1. Fetch solution context
    let solution = inMemorySolutions.get(solutionId);
    if (!solution) {
      try {
        solution = await Solution.findById(solutionId).lean();
      } catch (e) {}
    }

    const problemName = solution?.problem?.name || "the problem";
    const language = solution?.problem?.language || "C++";
    const optimalApproach = solution?.content?.approaches?.find(a => a.level === "Optimal") || solution?.content?.approaches?.[0];

    const contextPrompt = `You are the AlgoCraft AI Mentor, an elite, patient DSA instructor.
You are tutoring a software engineer on "${problemName}" in ${language}.

Problem Context:
- Optimal Intuition: ${optimalApproach?.intuition || "N/A"}
- Code snippet:
${optimalApproach?.code || "N/A"}
- Complexity: ${optimalApproach?.timeComplexity || "O(n)"}, Space: ${optimalApproach?.spaceComplexity || "O(1)"}

Previous Conversation History:
${history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join("\n")}

USER QUESTION:
"${message}"

Instructions:
1. Provide a concise, clear, and encouraging response directly answering the user's doubt.
2. If asking about a line of code, explain the exact role of that line and what happens if removed.
3. If asking for a variant or edge case, provide code modifications or trace.
4. Keep the tone pedagogical, sharp, and interview-focused.
5. Return raw JSON matching: { "reply": "your text response in markdown format" }`;

    try {
      const response = await generateGeminiContent(
        "You are an expert DSA mentor that returns { \"reply\": \"...\" } in raw JSON.",
        contextPrompt
      );

      return res.json({
        success: true,
        reply: response?.reply || "Here's the insight: carefully check how state variables update across loop iterations."
      });
    } catch (aiErr) {
      // Fallback response if offline
      let mockReply = "";
      const lower = message.toLowerCase();
      if (lower.includes("time") || lower.includes("complexity")) {
        mockReply = `In this solution, the time complexity is **${optimalApproach?.timeComplexity || "O(n)"}** because each element is visited at most a constant number of times. The space complexity is **${optimalApproach?.spaceComplexity || "O(1)"}** because we only allocate auxiliary storage for necessary pointers/hash tables.`;
      } else if (lower.includes("space") || lower.includes("memory")) {
        mockReply = `For space optimization, notice how the algorithm avoids creating duplicate array copies. If the interviewer strictly forbids extra memory, we can explore an in-place modification or two-pointer approach at the expense of slight runtime trade-offs.`;
      } else if (lower.includes("edge case") || lower.includes("duplicate")) {
        mockReply = `Great question! Duplicates require special attention. By checking the condition before updating our map or pointers, we prevent overwriting valid indices and safely pass edge cases like \`[3, 3]\` with target \`6\`.`;
      } else {
        mockReply = `That's an insightful point about **${problemName}**! In coding interviews, interviewers look for candidates who verify whether constraints allow a single-pass hash lookup or require in-place two-pointer traversal. Notice how maintaining the invariant state guarantees termination without infinite loops.`;
      }

      return res.json({
        success: true,
        reply: mockReply,
        fallback: true
      });
    }
  } catch (error) {
    console.error("Mentor chat error:", error);
    return res.status(500).json({ error: "Failed to communicate with mentor." });
  }
};
