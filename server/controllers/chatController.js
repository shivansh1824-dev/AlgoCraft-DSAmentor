import { generateGeminiContent } from "../services/geminiService.js";
import { inMemorySolutions, Solution } from "../models/solutionModel.js";

/**
 * AI Mentor Chat anchored to a problem solution.
 * Accepts either a solutionId (for DB lookup) OR a problemContext object
 * sent directly from the client — which is always available since the
 * SolutionResultPage already holds the full solution in state.
 */
export const handleMentorChat = async (req, res) => {
  try {
    const { solutionId, message, history = [], problemContext = null } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    // ─── 1. Resolve problem context ──────────────────────────────────────────
    // Priority: problemContext (from client) > in-memory map > MongoDB
    let ctx = problemContext;

    if (!ctx) {
      let solution = inMemorySolutions.get(solutionId);
      if (!solution) {
        try {
          solution = await Solution.findById(solutionId).lean();
        } catch (e) { /* MongoDB may not be connected */ }
      }

      if (solution) {
        const optimalApproach =
          solution?.content?.approaches?.find(a => a.level === "Optimal") ||
          solution?.content?.approaches?.[0];

        ctx = {
          name: solution?.problem?.name,
          language: solution?.problem?.language,
          topic: solution?.problem?.topic,
          difficulty: solution?.problem?.difficulty,
          platform: solution?.problem?.platform,
          optimalIntuition: optimalApproach?.intuition,
          optimalCode: optimalApproach?.code,
          timeComplexity: optimalApproach?.timeComplexity,
          spaceComplexity: optimalApproach?.spaceComplexity,
          stepByStep: optimalApproach?.stepByStep,
          edgeCases: solution?.content?.edgeCases,
          commonMistakes: solution?.content?.commonMistakes,
        };
      }
    }

    // ─── 2. Build context strings (graceful fallback if still null) ───────────
    const problemName    = ctx?.name       || "the DSA problem";
    const language       = ctx?.language   || "C++";
    const topic          = ctx?.topic      || "Data Structures & Algorithms";
    const difficulty     = ctx?.difficulty || "Medium";
    const platform       = ctx?.platform   || "LeetCode";
    const optimalCode    = ctx?.optimalCode    || "// Code not available";
    const optimalIntu    = ctx?.optimalIntuition || "Analyse the problem constraints to derive the optimal approach.";
    const timeComplexity = ctx?.timeComplexity  || "O(n)";
    const spaceComplexity= ctx?.spaceComplexity || "O(n)";

    const stepByStepStr = Array.isArray(ctx?.stepByStep) && ctx.stepByStep.length
      ? ctx.stepByStep.map((s, i) => `  ${i + 1}. ${s}`).join("\n")
      : "  Not available.";

    const edgeCasesStr = Array.isArray(ctx?.edgeCases) && ctx.edgeCases.length
      ? ctx.edgeCases.map(e => `  - ${e}`).join("\n")
      : "  - Empty/null inputs\n  - Duplicates\n  - Boundary values";

    const mistakesStr = Array.isArray(ctx?.commonMistakes) && ctx.commonMistakes.length
      ? ctx.commonMistakes.map(m => `  - ${m}`).join("\n")
      : "  - Off-by-one errors\n  - Mutating input unexpectedly";

    // ─── 3. Rich, problem-anchored system prompt ──────────────────────────────
    const systemPrompt = `You are AlgoCraft AI Mentor — a world-class, FAANG-level DSA instructor.
You are currently tutoring a software engineer on the problem "${problemName}" from ${platform}.

═══════════════════════ LOCKED PROBLEM CONTEXT ═══════════════════════
Problem: "${problemName}"
Topic: ${topic}
Difficulty: ${difficulty}
Language: ${language}

OPTIMAL APPROACH INTUITION:
${optimalIntu}

ALGORITHM STEPS:
${stepByStepStr}

OPTIMAL CODE (${language}):
\`\`\`
${optimalCode}
\`\`\`

TIME COMPLEXITY: ${timeComplexity}
SPACE COMPLEXITY: ${spaceComplexity}

CRITICAL EDGE CASES FOR THIS PROBLEM:
${edgeCasesStr}

COMMON MISTAKES IN THIS PROBLEM:
${mistakesStr}
═══════════════════════════════════════════════════════════════════════

STRICT MENTORING RULES:
1. ALWAYS anchor your response to the ACTUAL code and context above — never give generic DSA theory.
2. If asked about a line of code, reference the EXACT line from the code block above.
3. If asked about edge cases, use the ACTUAL edge cases listed above for "${problemName}".
4. If asked about complexity, explain WHY it is ${timeComplexity} / ${spaceComplexity} specifically for this algorithm.
5. Tone: sharp, encouraging, interview-focused. Treat the user as a candidate in a FAANG loop.
6. Format your reply in clean markdown (use **bold**, \`code\`, bullet lists).
7. Return ONLY raw JSON: { "reply": "your markdown response here" }`;

    // ─── 4. Build conversation-aware user prompt ──────────────────────────────
    const conversationHistory = history.length
      ? history.map(h => `${h.role === "user" ? "CANDIDATE" : "MENTOR"}: ${h.text}`).join("\n")
      : "";

    const userPrompt = conversationHistory
      ? `Previous conversation:\n${conversationHistory}\n\nCANDIDATE'S NEW QUESTION:\n"${message}"`
      : `CANDIDATE'S QUESTION:\n"${message}"`;

    // ─── 5. Call Gemini ───────────────────────────────────────────────────────
    try {
      const response = await generateGeminiContent(systemPrompt, userPrompt);
      return res.json({
        success: true,
        reply: response?.reply || "Let me walk you through this step-by-step based on the optimal approach above."
      });
    } catch (aiErr) {
      // ─── 6. Smart keyword-based fallback (problem-aware) ─────────────────
      const lower = message.toLowerCase();
      let fallbackReply = "";

      if (lower.includes("time") || lower.includes("complexity") || lower.includes("O(")) {
        fallbackReply = `**Time Complexity: ${timeComplexity}** for "${problemName}"\n\n${
          ctx?.timeComplexity
            ? `This is ${timeComplexity} because each element is visited at most once. The core loop runs n times, and the ${language === "Python" ? "dict" : "unordered_map"} lookup/insertion is O(1) amortized — so overall: **O(n)**.`
            : "Each element is processed in constant amortized time per iteration."
        }`;
      } else if (lower.includes("space") || lower.includes("memory")) {
        fallbackReply = `**Space Complexity: ${spaceComplexity}** for "${problemName}"\n\nThe auxiliary data structure (hash map / stack / DP table) can hold up to n elements in the worst case, giving us ${spaceComplexity} extra space.`;
      } else if (lower.includes("edge") || lower.includes("duplicate") || lower.includes("null") || lower.includes("empty")) {
        fallbackReply = `**Edge Cases for "${problemName}":**\n${edgeCasesStr}\n\nAlways validate these on a whiteboard before declaring your solution complete in an interview.`;
      } else if (lower.includes("code") || lower.includes("line") || lower.includes("implement")) {
        fallbackReply = `Here's the optimal ${language} implementation for **"${problemName}"**:\n\n\`\`\`${language.toLowerCase()}\n${optimalCode}\n\`\`\`\n\n**Key lines explained:**\n- The data structure stores previously seen values for O(1) lookup.\n- The loop invariant ensures correctness by checking the complement before insertion.`;
      } else if (lower.includes("step") || lower.includes("how") || lower.includes("approach") || lower.includes("algorithm")) {
        fallbackReply = `**Algorithm Steps for "${problemName}":**\n${stepByStepStr}\n\nThis approach achieves ${timeComplexity} time and ${spaceComplexity} space.`;
      } else {
        fallbackReply = `**Insight for "${problemName}":**\n\n${optimalIntu}\n\nThe optimal approach runs in **${timeComplexity}** time and **${spaceComplexity}** space. In your interview, start by articulating this intuition verbally before touching code.`;
      }

      return res.json({
        success: true,
        reply: fallbackReply,
        fallback: true
      });
    }
  } catch (error) {
    console.error("Mentor chat error:", error);
    return res.status(500).json({ error: "Failed to communicate with mentor." });
  }
};
