import './index.css';
import { renderInputScreen, renderLoading, renderResults, incrementUsage } from './ui.js';
import { analyzePrompt } from './api.js';
import { initBackground } from './background.js';
import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics
inject();

// Initialize 3D Background
initBackground();

async function handleGenerate(prompt) {
    // Determine API Key from env
    // NOTE: In a real production app, you'd proxy this through a backend to hide the key and rate limit there.
    // For this client-side demo, we use the env var directly.
    
    renderLoading();
    
    try {
        const data = await analyzePrompt(prompt);
        incrementUsage(); // Only increment on success
        renderResults(data);
    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
        // Go back to input
        renderInputScreen(handleGenerate);
    }
}

window._onSubmit = handleGenerate;

renderInputScreen(handleGenerate);
