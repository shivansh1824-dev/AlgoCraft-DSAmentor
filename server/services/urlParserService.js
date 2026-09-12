/**
 * URL Parser Service for LeetCode, GeeksforGeeks, Codeforces, and HackerRank
 */

// Heuristics dictionary for popular classic problems
const POPULAR_SLUGS = {
  "two-sum": { name: "Two Sum", difficulty: "Easy", topic: "Arrays & Hashing" },
  "3sum": { name: "3Sum", difficulty: "Medium", topic: "Two Pointers" },
  "trapping-rain-water": { name: "Trapping Rain Water", difficulty: "Hard", topic: "Two Pointers" },
  "lru-cache": { name: "LRU Cache", difficulty: "Medium", topic: "Linked List" },
  "median-of-two-sorted-arrays": { name: "Median of Two Sorted Arrays", difficulty: "Hard", topic: "Binary Search" },
  "longest-substring-without-repeating-characters": { name: "Longest Substring Without Repeating Characters", difficulty: "Medium", topic: "Sliding Window" },
  "container-with-most-water": { name: "Container With Most Water", difficulty: "Medium", topic: "Two Pointers" },
  "merge-k-sorted-lists": { name: "Merge k Sorted Lists", difficulty: "Hard", topic: "Linked List" },
  "valid-parentheses": { name: "Valid Parentheses", difficulty: "Easy", topic: "Stack & Queues" },
  "climbing-stairs": { name: "Climbing Stairs", difficulty: "Easy", topic: "Dynamic Programming" },
  "coin-change": { name: "Coin Change", difficulty: "Medium", topic: "Dynamic Programming" },
  "word-break": { name: "Word Break", difficulty: "Medium", topic: "Dynamic Programming" },
  "number-of-islands": { name: "Number of Islands", difficulty: "Medium", topic: "Graphs & BFS/DFS" },
  "course-schedule": { name: "Course Schedule", difficulty: "Medium", topic: "Graphs & BFS/DFS" },
  "binary-tree-maximum-path-sum": { name: "Binary Tree Maximum Path Sum", difficulty: "Hard", topic: "Trees & BST" }
};

/**
 * Format kebab-case slug into Title Case
 */
function slugToTitle(slug) {
  if (!slug) return "";
  return slug
    .replace(/[0-9]{5,}/g, "") // remove long numeric IDs (common in GFG)
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Strip basic HTML tags for plain text summaries
 */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse an external problem URL and return structured metadata
 */
export async function parseProblemUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("Invalid URL provided.");
  }

  const url = rawUrl.trim();

  // 1. Detect LeetCode
  const leetcodeMatch = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
  if (leetcodeMatch) {
    const slug = leetcodeMatch[1].toLowerCase();
    let result = {
      platform: "LeetCode",
      url,
      slug,
      name: slugToTitle(slug),
      difficulty: "Medium",
      topic: "Arrays & Hashing",
      constraints: "",
      summary: "",
      rawTags: []
    };

    // Check offline dictionary
    if (POPULAR_SLUGS[slug]) {
      const info = POPULAR_SLUGS[slug];
      result.name = info.name;
      result.difficulty = info.difficulty;
      result.topic = info.topic;
    }

    // Try live LeetCode GraphQL
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const gqlQuery = `
        query getQuestionDetail($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            title
            difficulty
            content
            topicTags {
              name
            }
          }
        }
      `;

      const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        body: JSON.stringify({
          query: gqlQuery,
          variables: { titleSlug: slug }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const q = data?.data?.question;
        if (q) {
          result.name = q.title || result.name;
          result.difficulty = q.difficulty || result.difficulty;
          if (Array.isArray(q.topicTags) && q.topicTags.length > 0) {
            result.rawTags = q.topicTags.map((t) => t.name);
            const firstTag = q.topicTags[0].name;
            if (firstTag.includes("Array") || firstTag.includes("Hash")) result.topic = "Arrays & Hashing";
            else if (firstTag.includes("Two Pointer")) result.topic = "Two Pointers";
            else if (firstTag.includes("Sliding Window")) result.topic = "Sliding Window";
            else if (firstTag.includes("Tree") || firstTag.includes("Binary Search Tree")) result.topic = "Trees & BST";
            else if (firstTag.includes("Graph") || firstTag.includes("Depth-First") || firstTag.includes("Breadth-First")) result.topic = "Graphs & BFS/DFS";
            else if (firstTag.includes("Dynamic Programming")) result.topic = "Dynamic Programming";
            else if (firstTag.includes("Binary Search")) result.topic = "Binary Search";
            else if (firstTag.includes("Stack")) result.topic = "Stack & Queues";
            else if (firstTag.includes("Linked List")) result.topic = "Linked List";
            else result.topic = firstTag;
          }

          if (q.content) {
            const cleanText = stripHtml(q.content);
            result.summary = cleanText.substring(0, 300) + (cleanText.length > 300 ? "..." : "");
          }
        }
      }
    } catch (netErr) {
      // Fallback already populated
    }

    return result;
  }

  // 2. Detect GeeksforGeeks
  const gfgMatch = url.match(/geeksforgeeks\.org\/problems\/([^/?#]+)/i);
  if (gfgMatch) {
    const slug = gfgMatch[1].toLowerCase();
    const cleanTitle = slugToTitle(slug);
    return {
      platform: "GeeksforGeeks",
      url,
      slug,
      name: cleanTitle,
      difficulty: "Medium",
      topic: "Arrays & Hashing",
      summary: `GeeksforGeeks problem: ${cleanTitle}`,
      rawTags: ["GFG"]
    };
  }

  // 3. Detect Codeforces
  const cfMatch = url.match(/codeforces\.com\/(?:problemset\/problem|contest\/\d+\/problem)\/([^/?#]+)/i);
  if (cfMatch) {
    const slug = cfMatch[1];
    return {
      platform: "Codeforces",
      url,
      slug,
      name: `Codeforces Problem ${slug}`,
      difficulty: "Medium",
      topic: "Algorithms",
      summary: `Codeforces problem: ${url}`,
      rawTags: ["Codeforces"]
    };
  }

  // 4. Generic Fallback
  return {
    platform: "Other",
    url,
    slug: "",
    name: "Custom Problem",
    difficulty: "Medium",
    topic: "Arrays & Hashing",
    summary: "",
    rawTags: []
  };
}
