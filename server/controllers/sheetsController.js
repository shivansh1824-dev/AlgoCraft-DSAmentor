import { Sheet, inMemorySheets } from "../models/sheetModel.js";

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
