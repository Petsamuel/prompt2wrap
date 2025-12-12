import './index.css';
import { renderInputScreen, renderLoading, renderResults, incrementUsage } from './ui.js';
import { analyzePrompt } from './api.js';
import { initBackground } from './background.js';
import { inject } from '@vercel/analytics';
import { getWrapped } from './firebase.js';

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

// Check for Share ID
const params = new URLSearchParams(window.location.search);
const shareId = params.get('id');

if (shareId) {
    // Render loading state while fetching shared data
    renderLoading();
    
    // Customize loading text for retrieval mode
    setTimeout(() => {
        const loadingTitle = document.querySelector('#loading-screen h2');
        if(loadingTitle) loadingTitle.innerText = "LOADING MEMORIES";
        const loadingStep = document.getElementById('loading-step');
        if(loadingStep) loadingStep.innerText = "FETCHING_ARCHIVES";
    }, 50);

    getWrapped(shareId)
        .then(data => {
            if (data) {
                renderResults(data, true); // true = isSharedView
            } else {
                alert('This Wrapped link is invalid or has expired.');
                window.history.replaceState({}, document.title, window.location.pathname);
                renderInputScreen(handleGenerate);
            }
        })
        .catch(err => {
            console.error('Failed to load shared wrapped:', err);
            alert('Could not load the shared Wrapped. Please try again.');
            window.history.replaceState({}, document.title, window.location.pathname);
            renderInputScreen(handleGenerate);
        });
} else {
    // Default flow
    renderInputScreen(handleGenerate);
}
