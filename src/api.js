// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL ||'http://localhost:3001';

/**
 * Analyze a prompt using the backend API
 * The backend securely handles the OpenRouter API key
 */
export async function analyzePrompt(prompt) {
  if (!prompt) throw new Error("Prompt is required");

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}
