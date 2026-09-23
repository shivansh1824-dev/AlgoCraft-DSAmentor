import { Sheet, inMemorySheets } from "../models/sheetModel.js";
import { generateGeminiContent } from "../services/geminiService.js";

/**
 * Get all problem sheets
 */
export const getSheets = async (req, res) => {
  try {
    let sheets = [];
    try {
      sheets = await Sheet.find().sort({ updatedAt: -1 }).lean();
    } catch (dbErr) {
      // MongoDB offline fallback
    }

    if (!sheets || sheets.length === 0) {
      sheets = Array.from(inMemorySheets.values());
    }

    return res.json({ success: true, count: sheets.length, sheets });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get single sheet by ID
 */
export const getSheetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (inMemorySheets.has(id)) {
      return res.json({ success: true, sheet: inMemorySheets.get(id) });
    }

    try {
      const sheet = await Sheet.findById(id).lean();
      if (sheet) return res.json({ success: true, sheet });
    } catch (err) {}

    return res.status(404).json({ error: "Sheet not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new custom problem sheet
 */
export const createSheet = async (req, res) => {
  try {
    const { title, description = "", sections = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Sheet title is required." });
    }

    const sheetId = "sheet_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    
    // Ensure all sections have unique IDs
    const formattedSections = sections.map((sec, idx) => ({
      id: sec.id || `sec_${Date.now()}_${idx}`,
      title: sec.title || `Section ${idx + 1}`,
      description: sec.description || "",
      problems: (sec.problems || []).map((p, pIdx) => ({
        id: p.id || `p_${Date.now()}_${pIdx}`,
        name: p.name,
        platform: p.platform || "LeetCode",
        url: p.url || "",
        difficulty: p.difficulty || "Medium",
        completed: Boolean(p.completed),
        notes: p.notes || ""
      }))
    }));

    const newSheet = {
      _id: sheetId,
      title: title.trim(),
      description: description.trim(),
      isTemplate: false,
      sections: formattedSections,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemorySheets.set(sheetId, newSheet);

    try {
      const doc = new Sheet({ ...newSheet, _id: undefined });
      await doc.save();
      newSheet._id = doc._id.toString();
    } catch (dbErr) {}

    return res.status(201).json({ success: true, sheet: newSheet });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update an existing sheet (title, description, sections)
 */
export const updateSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, sections } = req.body;

    if (inMemorySheets.has(id)) {
      const sheet = inMemorySheets.get(id);
      if (title) sheet.title = title.trim();
      if (description !== undefined) sheet.description = description.trim();
      if (sections) sheet.sections = sections;
      sheet.updatedAt = new Date();
      return res.json({ success: true, sheet });
    }

    try {
      const doc = await Sheet.findById(id);
      if (doc) {
        if (title) doc.title = title.trim();
        if (description !== undefined) doc.description = description.trim();
        if (sections) doc.sections = sections;
        doc.updatedAt = new Date();
        await doc.save();
        return res.json({ success: true, sheet: doc });
      }
    } catch (err) {}

    return res.status(404).json({ error: "Sheet not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Toggle problem completion status section-wise
 */
export const toggleProblemCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionId, problemId, completed } = req.body;

    if (inMemorySheets.has(id)) {
      const sheet = inMemorySheets.get(id);
      const section = sheet.sections?.find(s => s.id === sectionId);
      if (section) {
        const problem = section.problems?.find(p => p.id === problemId);
        if (problem) {
          problem.completed = completed !== undefined ? completed : !problem.completed;
          sheet.updatedAt = new Date();
          return res.json({ success: true, sheet, updatedProblem: problem });
        }
      }
    }

    try {
      const doc = await Sheet.findById(id);
      if (doc) {
        const section = doc.sections?.find(s => s.id === sectionId);
        if (section) {
          const problem = section.problems?.find(p => p.id === problemId);
          if (problem) {
            problem.completed = completed !== undefined ? completed : !problem.completed;
            doc.updatedAt = new Date();
            await doc.save();
            return res.json({ success: true, sheet: doc, updatedProblem: problem });
          }
        }
      }
    } catch (err) {}

    return res.status(404).json({ error: "Sheet, section, or problem not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a sheet
 */
export const deleteSheet = async (req, res) => {
  try {
    const { id } = req.params;

    if (inMemorySheets.has(id)) {
      inMemorySheets.delete(id);
      return res.json({ success: true, message: "Sheet deleted successfully." });
    }

    try {
      await Sheet.findByIdAndDelete(id);
      return res.json({ success: true, message: "Sheet deleted successfully." });
    } catch (err) {}

    return res.status(404).json({ error: "Sheet not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Intelligent heuristic fallback parser when AI is unreachable
 */
const heuristicExtractSheet = (rawText, defaultTitle) => {
  const TOPIC_KEYWORDS = [
    "Arrays & Hashing", "Arrays", "Strings", "Two Pointers", "Sliding Window",
    "Stack", "Queue", "Linked List", "Binary Search", "Trees", "Binary Trees",
    "Binary Search Tree", "Graphs", "BFS", "DFS", "Dynamic Programming", "DP",
    "Greedy", "Backtracking", "Heap", "Priority Queue", "Bit Manipulation", "Trie"
  ];

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const sectionsMap = new Map();
  let currentTopic = "General DSA & Fundamentals";

  for (const line of lines) {
    // Check if line matches a topic heading
    const matchedTopic = TOPIC_KEYWORDS.find(k => 
      new RegExp(`^#*\\s*(${k}|Day\\s*\\d+.*${k}|Step\\s*\\d+.*${k})`, "i").test(line) ||
      (line.length < 35 && line.toLowerCase().includes(k.toLowerCase()))
    );

    if (matchedTopic && line.length < 50) {
      currentTopic = matchedTopic.startsWith("Arrays") ? "Arrays & Hashing" :
                     matchedTopic.startsWith("DP") ? "Dynamic Programming" : matchedTopic;
      if (!sectionsMap.has(currentTopic)) sectionsMap.set(currentTopic, []);
      continue;
    }

    // Check if line looks like a problem name
    // Matches: "1. Two Sum", "Two Sum - Easy", "[LeetCode] Two Sum", bullet points, etc.
    const isProblemLine = /^(?:\d+[\.\)\-:]|\*|\-|\u2022)?\s*([A-Za-z0-9][A-Za-z0-9\s\-_()']+)/.test(line);
    if (!isProblemLine) continue;

    // Clean problem name
    let cleanName = line
      .replace(/^(?:\d+[\.\)\-:]|\*|\-|\u2022)\s*/, "")
      .replace(/\s*\(?(?:Easy|Medium|Hard)\)?/gi, "")
      .replace(/\s*\(?(?:LeetCode|GFG|GeeksforGeeks|CodeStudio)\)?/gi, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    if (cleanName.length < 3 || cleanName.length > 80) continue;
    // Skip if it's just a topic heading
    if (TOPIC_KEYWORDS.some(k => k.toLowerCase() === cleanName.toLowerCase())) continue;

    const lower = line.toLowerCase();
    const difficulty = lower.includes("hard") ? "Hard" :
                       lower.includes("easy") ? "Easy" : "Medium";
    const platform = lower.includes("gfg") || lower.includes("geek") ? "GeeksforGeeks" :
                     lower.includes("codestudio") || lower.includes("naukri") ? "CodeStudio" :
                     lower.includes("hackerrank") ? "HackerRank" : "LeetCode";

    if (!sectionsMap.has(currentTopic)) {
      sectionsMap.set(currentTopic, []);
    }

    const currentList = sectionsMap.get(currentTopic);
    if (!currentList.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
      currentList.push({
        name: cleanName,
        platform,
        difficulty,
        topic: currentTopic,
        url: ""
      });
    }
  }

  // If no structured topics were detected, group all extracted problems into a primary section
  if (sectionsMap.size === 0) {
    const allProblems = lines
      .filter(l => l.length > 3 && l.length < 80 && !l.startsWith("http"))
      .slice(0, 30)
      .map(name => ({
        name: name.replace(/^(?:\d+[\.\)\-:]|\*|\-|\u2022)\s*/, "").trim(),
        platform: "LeetCode",
        difficulty: "Medium",
        topic: "Core DSA Problems",
        url: ""
      }));

    sectionsMap.set("Core DSA Problems", allProblems);
  }

  const sections = Array.from(sectionsMap.entries()).map(([title, problems]) => ({
    title,
    problems
  })).filter(s => s.problems.length > 0);

  return {
    title: defaultTitle,
    description: `Extracted ${sections.reduce((a, s) => a + s.problems.length, 0)} problems organized across ${sections.length} topics.`,
    sections
  };
};

/**
 * Extract DSA problems from PDF text, CSV, or raw text using AI + heuristic fallback
 */
export const extractSheetFromText = async (req, res) => {
  try {
    const { text, title = "Custom DSA Sheet", filename = "" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text content is required." });
    }

    const cleanText = text.slice(0, 15000);

    const systemPrompt = `You are a world-class DSA curriculum engineer.
Extract all coding interview problems mentioned in the provided document text (from a PDF, sheet, or list).
Organize them into clear, logical topic sections (e.g. "Arrays & Hashing", "Two Pointers & Sliding Window", "Linked List", "Binary Search", "Trees", "Graphs", "Dynamic Programming", "Greedy", "Stack & Queue").

Return ONLY a raw JSON object with this exact schema (no markdown formatting, no code fences):
{
  "title": "Sheet Title",
  "description": "Short description of sheet contents",
  "sections": [
    {
      "title": "Topic Name",
      "problems": [
        {
          "name": "Exact Problem Name",
          "platform": "LeetCode",
          "difficulty": "Easy",
          "topic": "Topic Name",
          "url": ""
        }
      ]
    }
  ]
}`;

    const userPrompt = `Sheet Title: ${title || filename || "Custom DSA Sheet"}
Document Text:
${cleanText}

Extract all problems and organize them into topic sections. Infer platform (LeetCode/GeeksforGeeks) and difficulty (Easy/Medium/Hard) if not explicitly stated.`;

    let sheetData = null;

    try {
      sheetData = await generateGeminiContent(systemPrompt, userPrompt);
    } catch (aiErr) {
      console.warn("AI sheet extraction offline, using heuristic parser:", aiErr.message);
    }

    // Fallback heuristic extraction if Gemini is offline or failed
    if (!sheetData || !Array.isArray(sheetData.sections) || sheetData.sections.length === 0) {
      sheetData = heuristicExtractSheet(cleanText, title || filename || "Extracted DSA Sheet");
    }

    // Format into standard AlgoCraft sheet structure with unique IDs
    const sheetId = "sheet_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const formattedSections = (sheetData.sections || []).map((sec, sIdx) => ({
      id: `sec_${Date.now()}_${sIdx}`,
      title: sec.title || `Section ${sIdx + 1}`,
      description: sec.description || "",
      problems: (sec.problems || []).map((p, pIdx) => ({
        id: `p_${Date.now()}_${sIdx}_${pIdx}`,
        name: p.name || `Problem ${pIdx + 1}`,
        platform: p.platform || "LeetCode",
        difficulty: p.difficulty || "Medium",
        topic: sec.title || p.topic || "General",
        completed: false,
        url: p.url || "",
        notes: ""
      }))
    }));

    const finalSheet = {
      _id: sheetId,
      title: sheetData.title || title || "Imported DSA Sheet",
      description: sheetData.description || `Imported with ${formattedSections.reduce((acc, s) => acc + s.problems.length, 0)} problems organized into ${formattedSections.length} topics.`,
      isTemplate: false,
      sections: formattedSections,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemorySheets.set(sheetId, finalSheet);

    try {
      const doc = new Sheet({ ...finalSheet, _id: undefined });
      await doc.save();
      finalSheet._id = doc._id.toString();
    } catch (dbErr) {}

    return res.json({ success: true, sheet: finalSheet });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

