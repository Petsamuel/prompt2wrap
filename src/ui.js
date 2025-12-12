import { createIcons, icons } from 'lucide';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Chart from 'chart.js/auto';
import { setMood, setChaosLevel } from './background.js';
import { openShareModal } from './shareCapture.js';
import { createMusicToggle, initMusicToggle } from './music.js';
import { initTour } from './tour.js';
import { saveWrapped } from './firebase.js';

gsap.registerPlugin(ScrollTrigger);

const app = document.getElementById('app');

// Helper to get limit status
export function getUsageStatus() {
    const attempts = parseInt(localStorage.getItem('p2w_attempts') || '0');
    const max = 3;
    return { attempts, max, remaining: max - attempts };
}

export function incrementUsage() {
    const { attempts } = getUsageStatus();
    localStorage.setItem('p2w_attempts', (attempts + 1).toString());
}

export function renderInputScreen(onSubmit) {
  const { remaining, max } = getUsageStatus();
  const isLocked = remaining <= 0;
  const currentYear = new Date().getFullYear();

  app.innerHTML = `
    <div class="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" id="main-container">
      
      <!-- HEADER / MARQUEE -->
      <div class="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div class="animate-marquee whitespace-nowrap py-2 font-mono text-xs text-white/50 tracking-widest">
           PROMPT2WRAPPED // ${currentYear} // EXTREME EDITION // PUSHING LIMITS // VISUALIZING CHAOS // PROMPT2WRAPPED //
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center min-h-screen my-4">
        
        <!-- STACKED LOGO: PROMPT / 2 / WRAPPED -->
        <div class="text-center mb-12 relative" id="logo-container">
           <h1 class="font-display text-6xl md:text-8xl lg:text-[9rem] leading-none tracking-tighter text-white opacity-0" id="title-prompt">PROMPT</h1>
           <h1 class="font-display text-9xl md:text-[12rem] lg:text-[15rem] leading-none tracking-tighter text-neo-pink absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0" id="title-2">2</h1>
           <h1 class="font-display text-6xl md:text-8xl lg:text-[9rem] leading-none tracking-tighter text-white opacity-0" id="title-wrapped">WRAPPED</h1>
        </div>

        <!-- INPUT AREA -->
        <div class="w-full max-w-2xl opacity-0" id="input-card">
          <div class="neo-box p-8 md:p-12 relative group">
             <!-- DECORATIVE CORNERS -->
             <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neo-pink"></div>
             <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neo-pink"></div>
             <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neo-pink"></div>
             <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neo-pink"></div>

             ${isLocked ? `
               <div class="text-center">
                 <h2 class="text-3xl font-display text-neo-pink mb-4">SYSTEM LOCKED</h2>
                 <p class="font-mono text-white/60">Daily limit reached. Recharge required.</p>
               </div>
             ` : `
               <label class="block font-mono text-xs text-neo-pink mb-4 tracking-widest">PASTE YOUR PROMPTS ↴</label>
               <textarea 
                 id="prompt-input" 
                 rows="5" 
                 class="neo-input bg-transparent border-none text-xl md:text-2xl text-white font-bold placeholder:text-white/20 focus:ring-0 resize-none leading-tight" 
                 placeholder="Paste prompts, describe your year, or drop a ChatGPT share link..."></textarea>
               
               <div class="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                 <div class="flex items-center gap-4 text-xs font-mono text-white/40">
                    <span>${remaining}/${max} CREDITS</span>
                 </div>
                 <button id="generate-btn" class="neo-button group !text-sm ">
                    <span class="relative z-10 !group-hover:text-black">GENERATE WRAPPED</span>
                 </button>
               </div>
             `}
          </div>
        </div>

      </div>
      
      <div class="fixed bottom-4 right-4 z-40">
        <div class="font-mono text-xs text-white/30 text-right flex items-center justify-end gap-4">
          <button id="restart-tour-btn" class="hover:text-neo-pink transition-colors">[GUIDE]</button>
          <p>SYSTEM_STATUS: ONLINE</p>
        </div>
      </div>

      ${renderHelpOverlay()}

    </div>
  `;

  createIcons({ icons });

  // GSAP Animations for the STACKED LOGO
  const tl = gsap.timeline();
  
  tl.to('#title-prompt', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
    .to('#title-wrapped', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, "-=0.3")
    .to('#title-2', { opacity: 1, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, "-=0.2")
    .to('#input-card', { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }, "-=0.2");

  if (!isLocked) {
    const btn = document.getElementById('generate-btn');
    const input = document.getElementById('prompt-input');

    btn.addEventListener('click', () => {
      const val = input.value.trim();
      if (val) {
        gsap.to('#main-container', { scale: 1.05, opacity: 0, filter: 'blur(20px)', duration: 0.5, onComplete: () => onSubmit(val) });
      } else {
        gsap.fromTo(input, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
      }
    });

    input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            btn.click();
        }
    });
  }

  // --- HELP / INSTRUCTION SYSTEM ---
  const helpBtn = document.getElementById('help-trigger');
  const helpOverlay = document.getElementById('help-overlay');
  const closeHelpBtn = document.getElementById('close-help');

  if (helpBtn && helpOverlay && closeHelpBtn) {
      // Toggle Card logic
      helpBtn.addEventListener('click', () => {
          if (helpOverlay.classList.contains('hidden')) {
              helpOverlay.classList.remove('hidden');
              gsap.fromTo(helpOverlay, 
                  { opacity: 0, x: 20 }, 
                  { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
              );
              createIcons({ icons }); // Re-render icons for new content
          } else {
              gsap.to(helpOverlay, { 
                  opacity: 0, 
                  x: 20, 
                  duration: 0.3, 
                  ease: "power2.in", 
                  onComplete: () => helpOverlay.classList.add('hidden') 
              });
          }
      });

      const closeAction = () => {
          gsap.to(helpOverlay, { 
              opacity: 0, 
              x: 20, 
              duration: 0.3, 
              ease: "power2.in", 
              onComplete: () => helpOverlay.classList.add('hidden') 
          });
      };

      closeHelpBtn.addEventListener('click', closeAction);

      // --- TAB SWITCHING ---
      const tabHowto = document.getElementById('tab-howto');
      const tabPrompt = document.getElementById('tab-prompt');
      const contentHowto = document.getElementById('content-howto');
      const contentPrompt = document.getElementById('content-prompt');

      if (tabHowto && tabPrompt && contentHowto && contentPrompt) {
          tabHowto.addEventListener('click', () => {
              tabHowto.classList.add('text-neo-pink', 'border-neo-pink');
              tabHowto.classList.remove('text-white/50', 'border-transparent');
              tabPrompt.classList.remove('text-neo-pink', 'border-neo-pink');
              tabPrompt.classList.add('text-white/50', 'border-transparent');
              contentHowto.classList.remove('hidden');
              contentPrompt.classList.add('hidden');
          });

          tabPrompt.addEventListener('click', () => {
              tabPrompt.classList.add('text-neo-pink', 'border-neo-pink');
              tabPrompt.classList.remove('text-white/50', 'border-transparent');
              tabHowto.classList.remove('text-neo-pink', 'border-neo-pink');
              tabHowto.classList.add('text-white/50', 'border-transparent');
              contentPrompt.classList.remove('hidden');
              contentHowto.classList.add('hidden');
              createIcons({ icons }); // Re-render icons
          });
      }

      // --- COPY PROMPT FUNCTIONALITY ---
      const copyPromptBtn = document.getElementById('copy-prompt-btn');
      const copyPromptText = document.getElementById('copy-prompt-text');
      const wrappedPrompt = document.getElementById('wrapped-prompt');

      if (copyPromptBtn && wrappedPrompt) {
          copyPromptBtn.addEventListener('click', async () => {
              try {
                  await navigator.clipboard.writeText(wrappedPrompt.textContent);
                  if (copyPromptText) {
                      copyPromptText.textContent = 'Copied!';
                      copyPromptBtn.classList.add('bg-neo-green/30', 'border-neo-green/50');
                      setTimeout(() => {
                          copyPromptText.textContent = 'Copy';
                          copyPromptBtn.classList.remove('bg-neo-green/30', 'border-neo-green/50');
                      }, 2000);
                  }
              } catch (err) {
                  console.error('Failed to copy:', err);
              }
          });
      }

      // --- CLOSE AND GO TO INPUT FIELD ---
      const closeAndPasteBtn = document.getElementById('close-and-paste-btn');
      
      if (closeAndPasteBtn) {
          closeAndPasteBtn.addEventListener('click', () => {
              closeAction();
              // Focus the main input field after overlay closes
              setTimeout(() => {
                  const mainInput = document.getElementById('prompt-input');
                  if (mainInput) {
                      mainInput.focus();
                      mainInput.placeholder = 'Paste your JSON response here...';
                  }
              }, 350);
          });
      }
  }

  // Add music toggle to the page (only if not already there)
  if (!document.getElementById('music-toggle')) {
    const musicContainer = document.createElement('div');
    musicContainer.innerHTML = createMusicToggle();
    document.body.appendChild(musicContainer.firstElementChild);
  }
  initMusicToggle();
  
  // Initialize Tour (Auto-starts if not seen)
  const driverObj = initTour();
  
  // Restart Tour button
  const restartTxourBtn = document.getElementById('restart-tour-btn');
  if (restartTxourBtn) {
      restartTxourBtn.addEventListener('click', () => {
          driverObj.drive();
      });
  }
}

function renderHelpOverlay() {
    const { remaining } = getUsageStatus();
    const currentYear = new Date().getFullYear();
    
    const chatGptWrappedPrompt = `Make me a "ChatGPT Wrapped", like Spotify Wrapped, summarizing everything from my conversations this year.

I want it to be structured month by month, with honesty, personality, and a little wit. Capture my tone, patterns and growth across the year, not just topics.

Include overarching insights, emotional trends, key phrases I used often, and a verdict at the end that feels like both a roast and a recognition.

Format it like a year-end highlight reel - clear headers per month, short reflective blurbs, and a final "by-the-numbers" section (e.g., top words, themes, emotional states, etc.).

Write it in a human, conversational voice, clever but not cringe. Make it sound like an intelligent friend doing a funny, brutally honest wrap-up of my year with ChatGPT.

IMPORTANT: Format your response as valid JSON with this exact structure:
{
  "userName": "Your name or nickname for this user",
  "tagline": "A witty one-liner that captures their year",
  "months": [
    {
      "name": "January",
      "title": "Short catchy title for the month",
      "content": "2-3 sentence reflective blurb about this month",
      "mood": "dominant mood (e.g., 'curious', 'stressed', 'creative')",
      "iconName": "lucide icon name (e.g., 'brain', 'heart', 'rocket', 'coffee')"
    }
  ],
  "insights": ["insight 1", "insight 2", "insight 3"],
  "keyPhrases": ["phrase 1", "phrase 2", "phrase 3"],
  "topTopics": [
    {"topic": "Topic Name", "percentage": 25}
  ],
  "personalityTraits": {
    "curiosity": 85,
    "creativity": 70,
    "analytical": 90,
    "humor": 65,
    "intensity": 75
  },
  "communicationStyle": {
    "type": "The Curious Tinkerer",
    "description": "Brief description of their communication style",
    "strengths": ["strength 1", "strength 2"],
    "improvement": "Area for growth"
  },
  "emotionalStates": ["curious", "determined", "creative"],
  "funFacts": ["Fun fact 1", "Fun fact 2", "Fun fact 3"],
  "stats": [
    {"label": "TOP TOPIC", "value": "Topic name"},
    {"label": "MOOD", "value": "Dominant mood"}
  ],
  "finalVerdict": "A 2-3 sentence roast/recognition that's brutally honest but affectionate"
}`;

    return `
    <!-- HELP TRIGGER -->
    <button id="help-trigger" class="fixed top-8 right-8 z-50 text-white/50 hover:text-white transition-colors">
        <i data-lucide="help-circle" class="w-8 h-8"></i>
    </button>

    <!-- HELP CARD POPOVER -->
    <div id="help-overlay" class="fixed top-24 right-4 md:right-8 z-50 w-80 md:w-[32rem] neo-box p-0 hidden backdrop-blur-xl bg-black/95 border border-white/10 shadow-2xl shadow-neo-pink/10 max-h-[80vh] overflow-hidden flex-col">
        
        <!-- Tabs -->
        <div class="flex border-b border-white/10">
            <button id="tab-howto" class="flex-1 py-4 px-4 font-mono text-xs uppercase tracking-wider text-neo-pink border-b-2 border-neo-pink transition-all">
                How to Use
            </button>
            <button id="tab-prompt" class="flex-1 py-4 px-4 font-mono text-xs uppercase tracking-wider text-white/50 hover:text-white border-b-2 border-transparent transition-all">
                Prompt
            </button>
        </div>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto p-6">
            <!-- HOW TO USE TAB -->
            <div id="content-howto" class="tab-content">
                <ul class="space-y-5 font-mono text-sm text-white/80">
                    <li class="flex gap-4">
                        <span class="text-neo-green shrink-0">→</span>
                        <span>Paste your conversation history, prompts, or describe your year</span>
                    </li>
                    <li class="flex gap-4">
                        <span class="text-neo-green shrink-0">→</span>
                        <span>The AI will analyze your vibe and create a personalized "Wrapped"</span>
                    </li>
                    <li class="flex gap-4">
                        <span class="text-neo-green shrink-0">→</span>
                        <span>Scroll through your story with immersive 3D sections</span>
                    </li>
                    <li class="flex gap-4 items-center">
                        <span class="text-neo-green shrink-0">→</span>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span>Press</span>
                            <kbd class="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs">Ctrl + Enter</kbd>
                            <span>to submit</span>
                        </div>
                    </li>
                    <li class="flex gap-4 pt-4 border-t border-white/10 text-white/50">
                        <span class="text-neo-green shrink-0">→</span>
                        <span>You have <span class="text-white">${remaining} credits</span> remaining today</span>
                    </li>
                </ul>
            </div>

            <!-- CHATGPT WRAPPED TAB -->
            <div id="content-prompt" class="tab-content hidden">
                <div class="space-y-4">
                    <div class="text-center mb-6">
                        <p class="text-white/60 text-sm">Copy this prompt to ChatGPT, Claude, or any LLM to generate your Wrapped data, then paste the result below.</p>
                    </div>

                    <!-- Step 1: Copy Prompt -->
                    <div class="neo-box bg-white/5 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <span class="font-mono text-xs text-neo-green uppercase flex items-center gap-2">
                                <span class="w-5 h-5 rounded-full bg-neo-green/20 flex items-center justify-center text-neo-green">1</span>
                                Copy this prompt
                            </span>
                            <button id="copy-prompt-btn" class="px-3 py-1.5 bg-neo-pink/20 hover:bg-neo-pink/40 border border-neo-pink/50 rounded text-xs font-mono text-neo-pink transition-all flex items-center gap-2">
                                <i data-lucide="copy" class="w-3 h-3"></i>
                                <span id="copy-prompt-text">Copy</span>
                            </button>
                        </div>
                        <div class="bg-black/50 rounded p-3 max-h-32 overflow-y-auto">
                            <pre id="wrapped-prompt" class="text-xs text-white/70 whitespace-pre-wrap font-mono leading-relaxed">${chatGptWrappedPrompt}</pre>
                        </div>
                    </div>

                    <!-- Step 2: Use in LLM -->
                    <div class="neo-box bg-white/5 p-4 rounded-lg">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="w-5 h-5 rounded-full bg-neo-blue/20 flex items-center justify-center text-neo-blue font-mono text-xs">2</span>
                            <span class="font-mono text-xs text-neo-blue uppercase">Paste in your LLM & Generate</span>
                        </div>
                        <p class="text-white/50 text-xs">Use ChatGPT, Claude, Gemini, or any AI with access to your conversation history.</p>
                    </div>

                    <!-- Step 3: Paste Result -->
                    <div class="neo-box bg-white/5 p-4 rounded-lg">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="w-5 h-5 rounded-full bg-neo-yellow/20 flex items-center justify-center text-neo-yellow font-mono text-xs">3</span>
                            <span class="font-mono text-xs text-neo-yellow uppercase">Paste the result</span>
                        </div>
                        <p class="text-white/50 text-xs mb-3">Copy the JSON response from your LLM and paste it into the main input field below.</p>
                        
                    </div>
                </div>
            </div>
        </div>

        <!-- Close Button -->
        <button id="close-help" class="absolute top-3 right-3 text-white/20 hover:text-white transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>
    </div>
    `;
}

export function renderLoading() {
    app.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center z-50 relative" id="loading-screen">
        <div class="text-center space-y-8">
            <div class="relative w-32 h-32 mx-auto">
                <div class="absolute inset-0 border-4 border-neo-pink rounded-full border-t-transparent animate-spin"></div>
                <div class="absolute inset-2 border-4 border-neo-blue rounded-full border-b-transparent animate-spin-slow" style="animation-direction: reverse;"></div>
            </div>
            <h2 class="font-display text-4xl text-white tracking-widest animate-pulse">GENERATING</h2>
            <div class="h-8">
                <p class="font-mono text-sm text-neo-pink tracking-widest" id="loading-step">INITIALIZING NEURO LINK</p>
            </div>
            <p class="font-mono text-xs text-white/30 hidden" id="loading-timeout">Taking longer than usual... brilliance takes time.</p>
        </div>
      </div>
    `;
    
    const steps = [
        "READING BETWEEN LINES", 
        "DECODING CHAOS", 
        "ANALYZING VIBE SHIFT", 
        "EXTRACTING PERSONALITY", 
        "COMPILING RECEIPTS", 
        "GENERATING ROAST", 
        "APPLYING GLITTER", 
        "TRAINING NEURAL NET",
        "CALCULATING RIZZ SCORE",
        "RENDERING TRUTH",
        "FINAL POLISH"
    ];
    
    let i = 0;
    const interval = setInterval(() => {
        const el = document.getElementById('loading-step');
        if(el) {
            el.innerText = steps[i++ % steps.length];
        } else {
            clearInterval(interval);
        }
    }, 800);

    // Show timeout message after 8 seconds
    setTimeout(() => {
        const timeoutEl = document.getElementById('loading-timeout');
        if(timeoutEl) timeoutEl.classList.remove('hidden');
    }, 8000);
}

export function renderResults(data) {
    const currentYear = new Date().getFullYear();

    // Generate sections HTML from data.months
    const monthSections = data.months.map((month, i) => `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative section-month" data-mood="${month.mood}" data-index="${i}">
            <div class="max-w-3xl w-full text-center">
                <div class="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 border-2 border-white/20 rounded-full flex items-center justify-center bg-white/5">
                    <i data-lucide="${month.iconName || 'sparkles'}" class="w-12 h-12 md:w-16 md:h-16 text-neo-pink"></i>
                </div>
                <h2 class="font-display text-5xl md:text-7xl text-white mb-2 leading-none">${month.name}</h2>
                <p class="font-mono text-neo-pink text-lg md:text-xl mb-8">"${month.title}"</p>
                <p class="text-xl md:text-2xl text-white/80 leading-relaxed">${month.content}</p>
                <div class="mt-8 inline-block px-6 py-2 border border-white/20 rounded-full text-white/50 font-mono text-sm">Mood: ${month.mood}</div>
            </div>
        </section>
    `).join('');

    // Generate insights/stats sections
    const insightsSection = `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative">
            <div class="max-w-4xl w-full">
                <h2 class="font-display text-5xl md:text-7xl text-neo-pink text-center mb-16">YOUR INSIGHTS</h2>
                <ul class="space-y-6">
                    ${data.insights.map(ins => `<li class="text-xl md:text-2xl text-white/80 flex items-start gap-4"><span class="text-neo-green text-3xl">→</span>${ins}</li>`).join('')}
                </ul>
            </div>
        </section>
    `;

    const phrasesSection = `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative">
            <div class="max-w-4xl w-full">
                <h2 class="font-display text-5xl md:text-7xl text-neo-yellow text-center mb-16">YOUR QUOTES</h2>
                <div class="flex flex-wrap justify-center gap-4">
                    ${data.keyPhrases.map(p => `<span class="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-xl text-white font-mono">"${p}"</span>`).join('')}
                </div>
            </div>
        </section>
    `;

    // ===== NEW: Topic Distribution Section =====
    const topicsSection = data.topTopics ? `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative" id="topics-section">
            <div class="max-w-5xl w-full">
                <h2 class="font-display text-5xl md:text-7xl text-neo-green text-center mb-16">WHAT YOU TALKED ABOUT</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <!-- Donut Chart -->
                    <div class="neo-box p-8 aspect-square flex items-center justify-center max-w-md mx-auto w-full">
                        <canvas id="topicsChart"></canvas>
                    </div>
                    <!-- Topic List -->
                    <div class="space-y-4">
                        ${data.topTopics.map((t, i) => {
                            const colors = ['#ff90e8', '#23a0ff', '#00ff94', '#ffc900', '#ff6464'];
                            return `
                            <div class="flex items-center gap-4">
                                <div class="w-4 h-4 rounded-sm" style="background: ${colors[i % colors.length]}"></div>
                                <div class="flex-1">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="text-white font-medium">${t.topic}</span>
                                        <span class="text-white/60 font-mono text-sm">${t.percentage}%</span>
                                    </div>
                                    <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full transition-all duration-1000" style="width: ${t.percentage}%; background: ${colors[i % colors.length]}"></div>
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            </div>
        </section>
    ` : '';

    // ===== NEW: Personality Traits Radar Section =====
    const personalitySection = data.personalityTraits ? `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative" id="personality-section">
            <div class="max-w-5xl w-full">
                <h2 class="font-display text-5xl md:text-7xl text-neo-blue text-center mb-16">YOUR PERSONALITY</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <!-- Radar Chart -->
                    <div class="neo-box p-8 aspect-square flex items-center justify-center max-w-md mx-auto w-full">
                        <canvas id="personalityChart"></canvas>
                    </div>
                    <div class="space-y-6">
                        ${Object.entries(data.personalityTraits).map(([trait, score]) => `
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-white font-display text-xl uppercase">${trait}</span>
                                    <span class="text-neo-pink font-mono text-lg">${score}%</span>
                                </div>
                                <div class="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div class="h-full rounded-full transition-all duration-1000 ease-out personality-bar" data-target-width="${score}" style="width: 0%; background: linear-gradient(to right, #ff90e8, #23a0ff);"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </section>
    ` : '';

    // ===== NEW: Communication Style Section =====
    const communicationSection = data.communicationStyle ? `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative">
            <div class="max-w-3xl w-full text-center">
                <h2 class="font-display text-5xl md:text-7xl text-neo-pink text-center mb-8">YOUR STYLE</h2>
                <div class="neo-box p-8 md:p-12">
                    <p class="font-mono text-xs text-neo-green uppercase tracking-widest mb-4">Communication Type</p>
                    <h3 class="font-display text-4xl md:text-6xl text-white mb-6">${data.communicationStyle.type}</h3>
                    <p class="text-xl text-white/70 mb-8">${data.communicationStyle.description}</p>
                    <div class="flex flex-wrap justify-center gap-3 mb-8">
                        ${data.communicationStyle.strengths.map(s => `
                            <span class="px-4 py-2 bg-neo-green/20 border border-neo-green/50 rounded-full text-neo-green font-mono text-sm">✓ ${s}</span>
                        `).join('')}
                    </div>
                    <div class="text-sm text-white/50 font-mono">
                        Growth area: <span class="text-neo-yellow">${data.communicationStyle.improvement}</span>
                    </div>
                </div>
            </div>
        </section>
    ` : '';

    // ===== NEW: Fun Facts Section =====
    const funFactsSection = data.funFacts ? `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative">
            <div class="max-w-4xl w-full">
                <h2 class="font-display text-5xl md:text-7xl text-neo-yellow text-center mb-16">FUN FACTS</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${data.funFacts.map((fact, i) => {
                        const icons = ['zap', 'sparkles', 'target'];
                        const colors = ['neo-pink', 'neo-blue', 'neo-green'];
                        return `
                        <div class="neo-box p-6 text-center transform hover:scale-105 transition-transform">
                            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-${colors[i % colors.length]}/20 flex items-center justify-center">
                                <i data-lucide="${icons[i % icons.length]}" class="w-6 h-6 text-${colors[i % colors.length]}"></i>
                            </div>
                            <p class="text-white/80 text-sm leading-relaxed">${fact}</p>
                        </div>
                    `}).join('')}
                </div>
            </div>
        </section>
    ` : '';

    const statsSection = `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative" id="stats-section">
            <div class="max-w-5xl w-full">
                <h2 class="font-display text-5xl md:text-7xl text-neo-blue text-center mb-16">YOUR NUMBERS</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-2 gap-4">
                        ${data.stats.map((s, i) => `
                            <div class="neo-box p-6 text-center transform hover:scale-105 transition-transform overflow-hidden">
                                <div class="text-xl md:text-xl font-display text-white mb-2 overflow-hidden">${s.value}</div>
                                <div class="font-mono text-xs text-neo-pink uppercase overflow-hidden">${s.label}</div>
                            </div>
                        `).join('')}
                    </div>
                    <!-- Chart -->
                    <div class="neo-box p-8 aspect-square flex items-center justify-center">
                        <canvas id="statsChart"></canvas>
                    </div>
                </div>
            </div>
        </section>
    `;

    const finalSection = `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative">
            <div class="max-w-3xl w-full text-center my-2">
                <h2 class="font-display text-6xl md:text-8xl text-white mb-8">YOUR MOMENT</h2>
                <p class="text-2xl md:text-3xl text-white/90 leading-relaxed font-bold">${data.finalVerdict}</p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center my-4">
                        <button id="get-link-btn" class="neo-button inline-flex items-center gap-2 mr-2">
                            <i data-lucide="link" class="w-4 h-4 "></i>
                            SHARE LINK
                        </button>
                        <button id="share-btn" class="neo-button-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            DOWNLOAD GIF
                        </button>
                    </div>
                    <button id="reset-btn" class="neo-button mt-4">START OVER</button>
            </div>
        </section>
    `;

    app.innerHTML = `
      <div class="relative overflow-x-hidden" id="results-container">
        
        <!-- PROGRESS INDICATOR BARS (Stories-style) -->
        <div id="progress-bars" class="fixed top-0 left-0 right-0 z-50 flex gap-1 px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
            ${Array.from({length: data.months.length + 8}, (_, i) => `
                <div class="progress-bar-segment flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div class="progress-bar-fill h-full bg-white rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
            `).join('')}
        </div>
        
        <!-- AUTO-SCROLL TOGGLE -->
        <button id="auto-scroll-toggle" class="fixed top-8 right-4 z-50 px-4 py-2 bg-black/50 backdrop-blur-md border border-white/20 rounded-full font-mono text-xs text-white/70 hover:text-white hover:border-neo-pink transition-all flex items-center gap-2">
            <svg id="auto-scroll-play" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <svg id="auto-scroll-pause" class="w-4 h-4 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <span id="auto-scroll-label">AUTO</span>
        </button>
        
        <!-- HERO -->
        <section class="min-h-screen flex flex-col items-center justify-center px-8 relative">
            <div class="text-center">
                <p class="font-mono text-xs text-neo-pink tracking-widest mb-4">${currentYear} WRAPPED</p>
                <h1 class="font-display text-6xl md:text-8xl lg:text-9xl text-white leading-none mb-4">${data.userName}</h1>
                <p class="text-xl md:text-2xl text-white/60 italic max-w-xl mx-auto">"${data.tagline}"</p>
                <div class="mt-12 animate-bounce text-white/30 font-mono text-sm" id="scroll-hint">TAP AUTO OR SCROLL ↓</div>
            </div>
        </section>

        ${monthSections}
        ${insightsSection}
        ${phrasesSection}
        ${topicsSection}
        ${personalitySection}
        ${communicationSection}
        ${funFactsSection}
        ${statsSection}
        ${finalSection}

      </div>
    `;
    
    createIcons({ icons });

    // ScrollTrigger Animations for each section
    const moods = ['happy', 'creative', 'intense', 'calm', 'chaotic', 'focused', 'tired'];
    
    gsap.utils.toArray('section').forEach((section, i) => {
        // Content animation
        gsap.from(section.querySelectorAll('h1, h2, p, li, span, div:not(.neo-box)'), {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out'
        });
        
        // Background mood change on section enter
        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            onEnter: () => {
                const moodFromData = section.dataset.mood?.toLowerCase();
                const mood = moodFromData || moods[i % moods.length];
                const chaosLevel = (i % 3 === 0) ? 0.8 : (i % 2 === 0) ? 0.5 : 0.2;
                setMood(mood, (i + 1) / 6);
                setChaosLevel(chaosLevel);
            },
            onEnterBack: () => {
                const moodFromData = section.dataset.mood?.toLowerCase();
                const mood = moodFromData || moods[i % moods.length];
                setMood(mood, (i + 1) / 6);
            }
        });
    });

    // Animate personality trait bars when section enters viewport
    const personalitySectionEl = document.getElementById('personality-section');
    if (personalitySectionEl) {
        ScrollTrigger.create({
            trigger: personalitySectionEl,
            start: 'top 70%',
            onEnter: () => {
                const bars = personalitySectionEl.querySelectorAll('.personality-bar');
                bars.forEach((bar, i) => {
                    const targetWidth = bar.dataset.targetWidth;
                    setTimeout(() => {
                        bar.style.width = `${targetWidth}%`;
                    }, i * 150); // Stagger animation
                });
            },
            once: true // Only animate once
        });
    }

    // Stats Chart (Emotional States as Polar Area Chart)
    const chartCanvas = document.getElementById('statsChart');
    if (chartCanvas && data.emotionalStates && data.emotionalStates.length > 0) {
        const ctx = chartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: data.emotionalStates,
                datasets: [{
                    data: data.emotionalStates.map(() => Math.floor(Math.random() * 50) + 50), // Random intensity for visual effect
                    backgroundColor: [
                        'rgba(255, 144, 232, 0.7)', // Pink
                        'rgba(35, 160, 255, 0.7)',   // Blue
                        'rgba(0, 255, 148, 0.7)',    // Green
                        'rgba(255, 201, 0, 0.7)',    // Yellow
                        'rgba(255, 100, 100, 0.7)'   // Red
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        ticks: { display: false },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: { family: 'Space Mono', size: 10 },
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    // ===== NEW: Topics Donut Chart =====
    const topicsCanvas = document.getElementById('topicsChart');
    if (topicsCanvas && data.topTopics && data.topTopics.length > 0) {
        const topicsCtx = topicsCanvas.getContext('2d');
        new Chart(topicsCtx, {
            type: 'doughnut',
            data: {
                labels: data.topTopics.map(t => t.topic),
                datasets: [{
                    data: data.topTopics.map(t => t.percentage),
                    backgroundColor: [
                        'rgba(255, 144, 232, 0.8)',
                        'rgba(35, 160, 255, 0.8)',
                        'rgba(0, 255, 148, 0.8)',
                        'rgba(255, 201, 0, 0.8)',
                        'rgba(255, 100, 100, 0.8)'
                    ],
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '60%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // ===== NEW: Personality Radar Chart =====
    const personalityCanvas = document.getElementById('personalityChart');
    if (personalityCanvas && data.personalityTraits) {
        const personalityCtx = personalityCanvas.getContext('2d');
        const traits = Object.keys(data.personalityTraits);
        const scores = Object.values(data.personalityTraits);
        
        new Chart(personalityCtx, {
            type: 'radar',
            data: {
                labels: traits.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
                datasets: [{
                    label: 'Your Profile',
                    data: scores,
                    backgroundColor: 'rgba(255, 144, 232, 0.3)',
                    borderColor: 'rgba(255, 144, 232, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(255, 144, 232, 1)',
                    pointBorderColor: '#fff',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { 
                            display: false,
                            stepSize: 25
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.15)' },
                        pointLabels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: { family: 'Space Mono', size: 11 }
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Get Link button handler
    const getLinkBtn = document.getElementById('get-link-btn');
    if (getLinkBtn) {
        getLinkBtn.addEventListener('click', async () => {
             const originalText = getLinkBtn.innerHTML;
             try {
                 getLinkBtn.innerHTML = '<span class="animate-pulse">SAVING...</span>';
                 getLinkBtn.disabled = true;
                 
                 const id = await saveWrapped(data);
                 const url = window.location.origin + '?id=' + id;
                 
                 await navigator.clipboard.writeText(url);
                 getLinkBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4 mr-2"></i>COPIED!';
                 getLinkBtn.classList.add('bg-neo-green/20', 'text-neo-green', 'border-neo-green/50');
                 getLinkBtn.classList.remove('bg-neo-blue/20', 'text-neo-blue', 'border-neo-blue/50');
                 createIcons({ icons: ['check'] });
                 
                 setTimeout(() => {
                     getLinkBtn.innerHTML = originalText;
                     getLinkBtn.disabled = false;
                     getLinkBtn.classList.remove('bg-neo-green/20', 'text-neo-green', 'border-neo-green/50');
                     getLinkBtn.classList.add('bg-neo-blue/20', 'text-neo-blue', 'border-neo-blue/50');
                     createIcons({ icons: ['link'] });
                 }, 3000);
             } catch (err) {
                 console.error('Failed to save wrapped:', err);
                 getLinkBtn.innerHTML = 'ERROR';
                 setTimeout(() => {
                     getLinkBtn.innerHTML = originalText;
                     getLinkBtn.disabled = false;
                     createIcons({ icons: ['link'] });
                 }, 2000);
             }
        });
    }

    // Share button handler - try native share first, fall back to modal
    document.getElementById('share-btn').addEventListener('click', async () => {
        const shareBtn = document.getElementById('share-btn');
        const originalText = shareBtn.innerHTML;
        
        try {
            // Import share capture classes
            const { HighlightReel, GifConverter } = await import('./shareCapture.js');
            
            // Show loading state
            shareBtn.innerHTML = '<span class="animate-pulse">Creating GIF...</span>';
            shareBtn.disabled = true;
            
            // Create highlight reel
            const reel = new HighlightReel(data);
            const gifConverter = new GifConverter();
            await gifConverter.loadLibrary();
            
            // Capture frames
            const frames = [];
            let frameCount = 0;
            const targetFrames = 150; // ~5 seconds at 30fps equivalent
            const skipFrames = 9; // Capture every 9th frame to reduce size
            
            reel.onFrame((canvas) => {
                frameCount++;
                if (frameCount % skipFrames === 0 && frames.length < targetFrames) {
                    frames.push(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
                }
            });
            
            await new Promise((resolve) => {
                reel.onComplete(resolve);
                reel.start();
            });
            
            // Convert to GIF
            shareBtn.innerHTML = '<span class="animate-pulse">Generating GIF...</span>';
            const gifBlob = await gifConverter.convert(frames, reel.getCanvas().width, reel.getCanvas().height);
            
            // Create file for sharing
            const file = new File([gifBlob], 'my-wrapped.gif', { type: 'image/gif' });
            
            // Check if native share is available and can share files
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'My Prompt2Wrapped',
                    text: `Check out my ${new Date().getFullYear()} Wrapped!`
                });
            } else {
                // Fallback: download the file
                const url = URL.createObjectURL(gifBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'my-wrapped.gif';
                a.click();
                URL.revokeObjectURL(url);
            }
            
        } catch (err) {
            console.error('Share failed:', err);
            // Fall back to modal
            openShareModal(data);
        } finally {
            // Restore button
            shareBtn.innerHTML = originalText;
            shareBtn.disabled = false;
        }
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
         gsap.to('#results-container', { opacity: 0, y: -20, duration: 0.5, onComplete: () => renderInputScreen(window._onSubmit) });
    });

    // ========== AUTO-SCROLL FUNCTIONALITY ==========
    let autoScrollEnabled = false;
    let autoScrollInterval = null;
    const sections = document.querySelectorAll('section');
    let currentSectionIndex = 0;
    const AUTO_SCROLL_DELAY = 5000; // 5 seconds per section

    const autoScrollBtn = document.getElementById('auto-scroll-toggle');
    const playIcon = document.getElementById('auto-scroll-play');
    const pauseIcon = document.getElementById('auto-scroll-pause');
    const scrollLabel = document.getElementById('auto-scroll-label');

    function scrollToSection(index) {
        if (index >= sections.length) {
            // Reached the end, stop auto-scroll
            stopAutoScroll();
            return;
        }
        currentSectionIndex = index;
        sections[index].scrollIntoView({ behavior: 'smooth' });
    }

    function startAutoScroll() {
        autoScrollEnabled = true;
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        autoScrollBtn.classList.add('border-neo-pink', 'text-neo-pink');
        scrollLabel.textContent = 'PLAYING';
        
        // Scroll to next section immediately
        currentSectionIndex++;
        scrollToSection(currentSectionIndex);
        
        // Then continue every 5 seconds
        autoScrollInterval = setInterval(() => {
            currentSectionIndex++;
            scrollToSection(currentSectionIndex);
        }, AUTO_SCROLL_DELAY);
    }

    function stopAutoScroll() {
        autoScrollEnabled = false;
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        autoScrollBtn.classList.remove('border-neo-pink', 'text-neo-pink');
        scrollLabel.textContent = 'AUTO';
    }

    autoScrollBtn.addEventListener('click', () => {
        if (autoScrollEnabled) {
            stopAutoScroll();
        } else {
            startAutoScroll();
        }
    });

    // ========== PROGRESS BAR UPDATE ==========
    const progressFills = document.querySelectorAll('.progress-bar-fill');
    const SEGMENT_DURATION = AUTO_SCROLL_DELAY; // Time to fill each segment (5 seconds)
    let progressAnimationFrame = null;
    let segmentStartTime = Date.now();
    let lastActiveIndex = 0;
    
    function updateProgressBars(activeIndex, forceComplete = false) {
        // If section changed, reset timer for current segment
        if (activeIndex !== lastActiveIndex) {
            segmentStartTime = Date.now();
            lastActiveIndex = activeIndex;
        }
        
        progressFills.forEach((fill, index) => {
            if (index < activeIndex) {
                // Past sections are fully filled
                fill.style.transition = 'none';
                fill.style.width = '100%';
            } else if (index === activeIndex) {
                // Current section fills gradually
                if (forceComplete) {
                    fill.style.transition = 'none';
                    fill.style.width = '100%';
                } else {
                    const elapsed = Date.now() - segmentStartTime;
                    const progress = Math.min((elapsed / SEGMENT_DURATION) * 100, 100);
                    fill.style.transition = 'width 100ms linear';
                    fill.style.width = `${progress}%`;
                }
            } else {
                // Future sections are empty
                fill.style.transition = 'none';
                fill.style.width = '0%';
            }
        });
    }
    
    // Animate progress continuously
    function animateProgress() {
        // Find which section is most visible
        let activeIndex = 0;
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
                activeIndex = index;
            }
        });
        
        updateProgressBars(activeIndex);
        
        // Update current section for auto-scroll
        if (autoScrollEnabled) {
            currentSectionIndex = activeIndex;
        }
        
        progressAnimationFrame = requestAnimationFrame(animateProgress);
    }
    
    // Start animation
    animateProgress();

    // Initial progress bar state
    updateProgressBars(0);

    // Update on scroll (reset timer for new section)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Find which section is most visible
            let activeIndex = 0;
            sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
                    activeIndex = index;
                }
            });
            
            // If section changed, this will reset the timer
            updateProgressBars(activeIndex);
            
            // Update current section for auto-scroll
            if (autoScrollEnabled) {
                currentSectionIndex = activeIndex;
            }
        }, 50);
    }, { passive: true });
}

