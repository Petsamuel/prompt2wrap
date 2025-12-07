import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://prompt2wrap.vercel.app', 'https://www.prompt2wrap.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// System prompt for the AI analysis
const SYSTEM_PROMPT = `
You are a "Year-in-Review" style analyzer. Generate a fun, roast-y, "Spotify Wrapped" style summary of the user's input.

RULES:
1. Return ONLY a valid JSON object. No markdown, no conversational text.
2. Structure your response EXACTLY as the schema below.
3. Be witty, use gen-z/millennial humor, be bold in your roasts and praises.
4. All text fields should be short and punchy.
5. Keep it human, speak like a coach, not a bot. Be blunt but warm when needed.
6. Don't sound corporate, academic, or robotic. No overly formal language.
7. STRICTLY NO MARKDOWN FORMATTING in the JSON values. No asterisks for bold/italics.
8. STRICTLY NO em dashes. Use commas, colons, or periods instead.
9. Plain text only in all string values.
10. For numerical scores, use integers between 0-100.
11. Analyze deeply: find patterns, quirks, and interesting observations.

JSON SCHEMA (Match this EXACTLY):
{
  "userName": "A creative nickname for the user based on their prompt (e.g., 'The Code Whisperer', 'Chaos Merchant')",
  "tagline": "A short, witty one-liner summary of their vibe",
  "months": [
    {
      "name": "JANUARY",
      "title": "A catchy short title for this period",
      "content": "2-3 sentences describing the vibe/events of this period.",
      "mood": "A one-word or short phrase mood",
      "iconName": "A Lucide icon name (choose from: rocket, brain, code, coffee, zap, flame, heart, star, sun, moon, cloud, sparkles, music, camera, target, trophy, gift, calendar, clock, compass)"
    }
  ],
  "insights": [
    "Insight 1 about the user",
    "Insight 2",
    "Insight 3"
  ],
  "keyPhrases": [
    "Phrase the user likely says a lot",
    "Another phrase"
  ],
  "emotionalStates": [
    "Top emotional state (e.g., 'Motivated-tired')",
    "Another state"
  ],
  "stats": [
    { "label": "A fun stat label", "value": "A witty value" },
    { "label": "Another stat", "value": "Another value" }
  ],
  "topTopics": [
    { "topic": "Main topic discussed", "percentage": 35 },
    { "topic": "Second topic", "percentage": 25 },
    { "topic": "Third topic", "percentage": 20 },
    { "topic": "Fourth topic", "percentage": 12 },
    { "topic": "Other", "percentage": 8 }
  ],
  "personalityTraits": {
    "creative": 75,
    "analytical": 60,
    "chaotic": 85,
    "focused": 45,
    "ambitious": 80
  },
  "communicationStyle": {
    "type": "A fun style name (e.g., 'The Strategist', 'Chaos Agent', 'The Optimizer')",
    "description": "1-2 sentences describing their communication pattern",
    "strengths": ["Strength 1", "Strength 2"],
    "improvement": "One area they could improve"
  },
  "funFacts": [
    "A quirky observation about patterns (e.g., 'You used urgent 89 times but please only 12 times')",
    "Another fun fact",
    "One more observation"
  ],
  "finalVerdict": "A 2-3 sentence closing roast and praise. Be bold."
}
`;

// API endpoint for analyzing prompts
app.post('/api/analyze', async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not found in environment');
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://prompt-to-wrapped.app',
        'X-Title': 'Prompt to Wrapped',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.85,
        max_tokens: 2000,
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenRouter API Error:', response.status, errorBody);
      return res.status(response.status).json({ 
        error: `API Error: ${response.status}`,
        details: errorBody 
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON from the AI response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return res.json(parsed);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      console.error(parseError);
      
      // Return a fallback response
      return res.json({
        userName: 'Parse Error',
        tagline: 'The AI got too creative. Try again!',
        months: [{ 
          name: 'ERROR', 
          title: 'Parsing Failed', 
          content: 'The AI response was not valid JSON.', 
          mood: 'Glitched', 
          iconName: 'alert-triangle' 
        }],
        insights: ['AI broke the format.'],
        keyPhrases: ['Try again.'],
        emotionalStates: ['Confused'],
        stats: [{ label: 'Success Rate', value: '0%' }],
        finalVerdict: 'Something went wrong. The AI needs a nap.'
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('silence is golden');
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// CHATGPT SHARE LINK FETCHER
// ============================================

/**
 * Fetch and extract content from a ChatGPT share link
 * ChatGPT pages are JS-rendered but may contain __NEXT_DATA__ with conversation data
 */
app.post('/api/fetch-share', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  // Validate it's a ChatGPT share URL
  const chatgptSharePattern = /^https?:\/\/(chat\.openai\.com|chatgpt\.com)\/share\/[a-zA-Z0-9-]+$/;
  if (!chatgptSharePattern.test(url)) {
    return res.status(400).json({ 
      error: 'Invalid URL format',
      message: 'Please provide a valid ChatGPT share link (e.g., https://chatgpt.com/share/...)'
    });
  }
  
  try {
    // Fetch the share page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Failed to fetch share link',
        status: response.status 
      });
    }
    
    const html = await response.text();
    
    // Try to extract __NEXT_DATA__ JSON (Next.js apps embed data here)
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        
        // Look for conversation data in the props
        const pageProps = nextData?.props?.pageProps;
        const serverResponse = pageProps?.serverResponse || pageProps?.sharedConversationResponse;
        
        if (serverResponse?.data) {
          const conversationData = serverResponse.data;
          const title = conversationData.title || 'Untitled Conversation';
          const messages = conversationData.mapping || conversationData.linear_conversation || [];
          
          // Extract message content
          let conversationText = `Conversation: ${title}\n\n`;
          
          if (typeof messages === 'object' && !Array.isArray(messages)) {
            // Handle mapping format (object with message IDs as keys)
            Object.values(messages).forEach(node => {
              if (node?.message?.content?.parts) {
                const role = node.message.author?.role || 'unknown';
                const content = node.message.content.parts.join('\n');
                if (content.trim()) {
                  conversationText += `[${role.toUpperCase()}]: ${content}\n\n`;
                }
              }
            });
          } else if (Array.isArray(messages)) {
            // Handle array format
            messages.forEach(msg => {
              if (msg?.content) {
                const role = msg.role || 'unknown';
                conversationText += `[${role.toUpperCase()}]: ${msg.content}\n\n`;
              }
            });
          }
          
          return res.json({ 
            success: true, 
            title,
            content: conversationText.trim(),
            source: 'chatgpt_share'
          });
        }
      } catch (parseErr) {
        console.error('Failed to parse __NEXT_DATA__:', parseErr);
      }
    }
    
    // Fallback: Try to extract any visible text content
    // Look for conversation content in common patterns
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - ChatGPT', '').trim() : 'Shared Conversation';
    
    // Try og:description meta tag
    const ogDescMatch = html.match(/<meta property="og:description" content="([^"]*)">/);
    const description = ogDescMatch ? ogDescMatch[1] : '';
    
    if (description) {
      return res.json({
        success: true,
        title,
        content: `ChatGPT Conversation: ${title}\n\n${description}`,
        source: 'meta_tags',
        note: 'Limited content extracted. For full conversation, please copy the conversation text directly.'
      });
    }
    
    // If we couldn't extract anything useful
    return res.status(422).json({
      error: 'Could not extract conversation content',
      message: 'The share page format may have changed. Please copy paste the conversation text directly.',
      title
    });
    
  } catch (error) {
    console.error('Fetch share link error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch share link', 
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/analyze`);
});

