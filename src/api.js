const SYSTEM_PROMPT = `
You are a "Year-in-Review" style analyzer. Generate a fun, roast-y, "Spotify Wrapped" style summary of the user's input.

RULES:
1. Return ONLY a valid JSON object. No markdown, no conversational text.
2. Structure your response EXACTLY as the schema below.
3. Be witty, use gen-z/millennial humor, be bold in your roasts and praises.
4. All text fields should be short and punchy.
5. Keep it human, speak like a coach, not a bot. Be blunt but warm when needed.
6. Don't sound corporate, academic, or robotic. No overly formal language.
7. STRICTLY NO MARKDOWN FORMATTING in the JSON values. No asterisks for bold/italics (e.g., *word* or **word**).
8. STRICTLY NO em dashes. Use commas, colons, or periods instead.
9. Plain text only in all string values.

JSON SCHEMA (Match this EXACTLY):
{
  "userName": "A creative nickname for the user based on their prompt (e.g., 'The Code Whisperer', 'Chaos Merchant')",
  "tagline": "A short, witty one-liner summary of their vibe (e.g., 'Your year in vibes, code, and caffeinated decisions.')",
  "months": [
    {
      "name": "JANUARY",
      "title": "A catchy short title for this period (e.g., 'New Year, Same Debugging.')",
      "content": "2-3 sentences describing the vibe/events of this period. Be specific and creative.",
      "mood": "A one-word or short phrase mood (e.g., 'Hopeful but tired')",
      "iconName": "A Lucide icon name that fits the vibe (choose from: rocket, brain, code, coffee, zap, flame, heart, star, sun, moon, cloud, sparkles, music, camera, target, trophy, gift, calendar, clock, compass)"
    }
    // Include 4-6 months/periods. You can combine months if needed (e.g., "AUGUST-OCTOBER").
  ],
  "insights": [
    "Insight 1 about the user (e.g., 'You think in projects, not feelings.')",
    "Insight 2",
    "Insight 3"
  ],
  "keyPhrases": [
    "Phrase the user likely says a lot (e.g., 'Make it shorter.')",
    "Another phrase"
  ],
  "emotionalStates": [
    "Top emotional state (e.g., 'Motivated-tired')",
    "Another state"
  ],
  "stats": [
    { "label": "A fun stat label (e.g., 'Projects Started')", "value": "A witty value (e.g., '14, finished 6')" },
    { "label": "Another stat", "value": "Another value" }
  ],
  "finalVerdict": "A 2-3 sentence closing roast and praise. Be bold."
}
`;

export async function analyzePrompt(prompt) {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("API Key is not configured in the environment.");
  if (!prompt) throw new Error("Prompt is required");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://prompt-to-wrapped.app",
      "X-Title": "Prompt to Wrapped",
    },
    body: JSON.stringify({
      "model": "google/gemma-3-27b-it",
      "messages": [
        { "role": "system", "content": SYSTEM_PROMPT },
        { "role": "user", "content": prompt }
      ],
      "temperature": 0.85,
      "max_tokens": 2000,
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("No JSON object found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("Failed to parse JSON:", content);
    console.error(e);
    return {
        userName: "Parse Error",
        tagline: "The AI got too creative. Try again!",
        months: [{ name: "ERROR", title: "Parsing Failed", content: "The AI response was not valid JSON.", mood: "Glitched", iconName: "alert-triangle" }],
        insights: ["AI broke the format."],
        keyPhrases: ["Try again."],
        emotionalStates: ["Confused"],
        stats: [{ label: "Success Rate", value: "0%" }],
        finalVerdict: "Something went wrong. The AI needs a nap."
    };
  }
}
