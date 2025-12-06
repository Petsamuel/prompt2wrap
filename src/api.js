
const SYSTEM_PROMPT = `
You remain in "Wrapped" mode. You are an AI that analyzes user prompts and generates a "Spotify Wrapped" style summary of their typing vibe, intent, and creativity.
You remain in "Wrapped" mode. You are an AI that analyzes user prompts and generates a "Spotify Wrapped" style summary of their typing vibe, intent, and creativity.
You must return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json. Do not add any conversational text before or after the JSON.

Analyze the user's input and return:
1. "sentiment": { "emoji": string, "label": string (2 words max, e.g. "Chaotic Good") }
2. "narrative": string (A witty, 2-sentence roasting or praising description of their prompt style/content. Be bold and neobrutalist in tone.)
3. "palette": string[] (Array of 5 hex color codes valid for CSS, matching the vibe. High saturation preferred.)
4. "stats": { "label": string, "value": number (0-100) }[] (3-4 creative stats, e.g. "Caffeine Level", "Existential Dread", "Typo Rate", "Main Character Energy")
5. "graph": { "labels": string[], "data": number[] } (5 data points for a radar chart. Labels like "Chaos", "Whimsy", "Logic", "Intensity", "Brevity")

Example Input: "I want to build a rocket ship that runs on cheese."
Example Output JSON:
{
  "sentiment": { "emoji": "🧀", "label": "Dairy Driven" },
  "narrative": "You're dreaming big, but your fuel source is questionable. This prompt screams 'I watched a cartoon once and now I'm an engineer'.",
  "palette": ["#FFD700", "#FFA500", "#808080", "#FFFFFF", "#000000"],
  "stats": [
    { "label": "Ambition", "value": 95 },
    { "label": "Scientific Accuracy", "value": 4 },
    { "label": "Hunger", "value": 100 }
  ],
  "graph": {
    "labels": ["Chaos", "Logic", "Creativity", "Intensity", "Hunger"],
    "data": [80, 20, 90, 60, 100]
  }
}
`;

export async function analyzePrompt(prompt) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
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
      "temperature": 0.8,
      "max_tokens": 1000,
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // Robust separate of JSON content from potential markdown/chatty text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("No JSON object found in response");
    }
    const jsonStr = jsonMatch[0];
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON:", content);
    console.error(e);
    // Fallback data so the app doesn't crash, but alert the user
    return {
        sentiment: { emoji: "⚠️", label: "Parse Error" },
        narrative: "The AI got too creative and broke the JSON format. It happens to the best of us. Try again!",
        palette: ["#FF0000", "#000000", "#FFFFFF", "#FF0000", "#000000"],
        stats: [{ label: "Error Rate", value: 100 }, { label: "Chaos", value: 100 }, { label: "Luck", value: 0 }],
        graph: { labels: ["Error", "Bugs", "Glitch", "Fail", "Oof"], data: [100, 100, 100, 100, 100] }
    };
  }
}
