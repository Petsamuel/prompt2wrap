// API configuration
const API_BASE_URL = import.meta.env.API_URL ||'http://localhost:3001';

/**
 * Check if input is a ChatGPT share URL
 */
function isChatGPTShareUrl(input) {
  const pattern = /^https?:\/\/(chat\.openai\.com|chatgpt\.com)\/share\/[a-zA-Z0-9-]+$/;
  return pattern.test(input.trim());
}

/**
 * Fetch conversation content from a ChatGPT share link
 */
async function fetchChatGPTShare(url) {
  const response = await fetch(`${API_BASE_URL}/api/fetch-share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url.trim() })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch share link' }));
    throw new Error(errorData.message || errorData.error || 'Failed to fetch share link');
  }

  const data = await response.json();
  return data.content;
}

/**
 * Analyze a prompt using the backend API
 * The backend securely handles the OpenRouter API key
 * 
 * Supports both:
 * - Direct text prompts
 * - ChatGPT share URLs (will fetch content first)
 */
export async function analyzePrompt(prompt) {
  if (!prompt) throw new Error("Prompt is required");

  let contentToAnalyze = prompt;

  // Check if input is a ChatGPT share URL
  if (isChatGPTShareUrl(prompt)) {
    try {
      contentToAnalyze = await fetchChatGPTShare(prompt);
    } catch (err) {
      throw new Error(`Could not fetch share link: ${err.message}. Please copy paste the conversation text directly.`);
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: contentToAnalyze })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

