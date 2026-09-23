const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

/**
 * Generate structured content using Google Gemini API
 */
export const generateGeminiContent = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey.length < 10) {
    throw new Error("Missing or invalid GEMINI_API_KEY in environment.");
  }

  // Fast-fail if the key is obviously an OAuth token or invalid format
  if (apiKey.startsWith("AQ.") || !apiKey.startsWith("AIzaSy")) {
    throw new Error(
      "GEMINI_API_KEY must be a valid Google AI Studio API key starting with 'AIzaSy'. " +
      "Get a free API key at https://aistudio.google.com/app/apikey."
    );
  }

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUser Request:\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: "application/json"
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ Model ${model} returned status ${response.status}:`, errorText.slice(0, 200));
        // If unauthenticated or forbidden, the key itself is wrong — abort trying other models
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Gemini Authentication Failed (${response.status}): ${errorText.slice(0, 150)}`);
        }
        lastError = new Error(`Gemini API error (${model} - ${response.status}): ${errorText}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error(`Empty response returned from ${model}`);
      }

      // Parse JSON safely
      const cleanJson = rawText.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn(`⚠️ Attempt with ${model} failed:`, err.message);
      lastError = err;
      if (err.message.includes("Gemini Authentication Failed")) {
        throw err;
      }
    }
  }

  throw lastError || new Error("All Gemini API models failed.");
};
