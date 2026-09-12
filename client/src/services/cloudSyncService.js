import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

/**
 * Cloud Synchronization Service for AlgoCraft
 * Provides seamless sync between local state and Supabase PostgreSQL tables
 */

// 1. Save or Update Solution
export async function syncSaveSolution(solution, user) {
  // Always persist in local storage cache
  try {
    const existing = JSON.parse(localStorage.getItem("algocraft_solutions") || "[]");
    const filtered = existing.filter((s) => s.id !== solution.id);
    localStorage.setItem("algocraft_solutions", JSON.stringify([solution, ...filtered]));
  } catch (e) {
    console.error("Local storage error:", e);
  }

  // If Supabase is connected & user is logged in (and not demo mode)
  if (isSupabaseConfigured && user && !user.isDemo) {
    try {
      const { data, error } = await supabase.from("solutions").upsert({
        id: solution.id,
        user_id: user.id,
        problem_title: solution.problem?.title || "Untitled Problem",
        problem_slug: solution.problem?.slug || "",
        platform: solution.problem?.platform || "LeetCode",
        difficulty: solution.problem?.difficulty || "Medium",
        topic: solution.problem?.topic || "General",
        intuition: solution.intuition || "",
        optimal_approach: solution.approaches?.optimal || {},
        code: solution.code || {},
        dry_run_steps: solution.dryRun || [],
        time_complexity: solution.complexity?.time || "O(n)",
        space_complexity: solution.complexity?.space || "O(1)",
        bookmarked: Boolean(solution.bookmarked),
        updated_at: new Date().toISOString()
      });

      if (error) console.error("Supabase solution sync error:", error);
      return data;
    } catch (err) {
      console.error("Cloud sync failed:", err);
    }
  }
}

// 2. Fetch User Solutions
export async function syncLoadSolutions(user) {
  if (isSupabaseConfigured && user && !user.isDemo) {
    try {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          problem: {
            title: row.problem_title,
            slug: row.problem_slug,
            platform: row.platform,
            difficulty: row.difficulty,
            topic: row.topic
          },
          intuition: row.intuition,
          approaches: { optimal: row.optimal_approach },
          code: row.code,
          dryRun: row.dry_run_steps,
          complexity: { time: row.time_complexity, space: row.space_complexity },
          bookmarked: row.bookmarked,
          createdAt: row.created_at
        }));
      }
    } catch (err) {
      console.error("Cloud load solutions failed:", err);
    }
  }

  // Fallback to local storage
  try {
    return JSON.parse(localStorage.getItem("algocraft_solutions") || "[]");
  } catch (e) {
    return [];
  }
}

// 3. Save Flashcard Progress
export async function syncSaveFlashcardProgress(progressMap, user) {
  try {
    localStorage.setItem("algocraft_flashcard_progress", JSON.stringify(progressMap));
  } catch (e) {
    console.error("Local flashcard storage error:", e);
  }

  if (isSupabaseConfigured && user && !user.isDemo) {
    try {
      const rows = Object.entries(progressMap).map(([cardId, val]) => ({
        user_id: user.id,
        card_id: cardId,
        repetitions: val.repetitions || 0,
        interval: val.interval || 1,
        ease_factor: val.easeFactor || 2.5,
        due_date: val.dueDate || new Date().toISOString(),
        last_reviewed: new Date().toISOString()
      }));

      await supabase.from("flashcard_progress").upsert(rows, { onConflict: "user_id,card_id" });
    } catch (err) {
      console.error("Cloud flashcard sync failed:", err);
    }
  }
}
