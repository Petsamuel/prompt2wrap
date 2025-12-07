import { createIcons, icons } from 'lucide';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Chart from 'chart.js/auto';
import { setMood, setChaosLevel } from './background.js';

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
      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center min-h-screen">
        
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
               <label class="block font-mono text-xs text-neo-pink mb-4 tracking-widest">PASTE YOUR CONVERSATION / PROMPT HISTORY</label>
               <textarea 
                 id="prompt-input" 
                 rows="5" 
                 class="neo-input bg-transparent border-none text-xl md:text-2xl text-white font-bold placeholder:text-white/20 focus:ring-0 resize-none leading-tight" 
                 placeholder="Paste your year's worth of prompts, your vibe check, or just describe your journey..."></textarea>
               
               <div class="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                 <div class="flex items-center gap-4 text-xs font-mono text-white/40">
                    <span>${remaining}/${max} CREDITS</span>
                 </div>
                 <button id="generate-btn" class="neo-button group !text-lg">
                    <span class="relative z-10 group-hover:text-black ">GENERATE WRAPPED</span>
                 </button>
               </div>
             `}
          </div>
        </div>

      </div>
      
      <div class="fixed bottom-4 right-4 z-40">
        <div class="font-mono text-xs text-white/30 text-right">
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
      // Pulse animation for the trigger (Disabled for cleaner look)
      // gsap.to(helpBtn, { 
      //     scale: 1.05, 
      //     duration: 2, 
      //     repeat: -1, 
      //     yoyo: true, 
      //     ease: "sine.inOut" 
      // });

      // Toggle Card logic
      helpBtn.addEventListener('click', () => {
          if (helpOverlay.classList.contains('hidden')) {
              helpOverlay.classList.remove('hidden');
              gsap.fromTo(helpOverlay, 
                  { opacity: 0, x: 20 }, 
                  { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
              );
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
  }
}

function renderHelpOverlay() {
    const { remaining } = getUsageStatus(); // Access the exported function if possible, or just read storage. 
    // Since getUsageStatus is exported from this file, we can use it, but `renderHelpOverlay` is outside the module scope where it's defined? 
    // No, it's in the same file.
    
    return `
    <!-- HELP TRIGGER -->
    <button id="help-trigger" class="fixed top-8 right-8 z-50 text-white/50 hover:text-white transition-colors">
        <i data-lucide="help-circle" class="w-8 h-8"></i>
    </button>

    <!-- HELP CARD POPOVER -->
    <div id="help-overlay" class="fixed top-24 right-4 md:right-8 z-50 w-80 md:w-96 neo-box p-6 hidden backdrop-blur-xl bg-black/90 border border-white/10 shadow-2xl shadow-neo-pink/10">
        <!-- Header -->
        <h3 class="font-display text-2xl text-neo-pink mb-6 uppercase">How to use</h3>
        
        <!-- List -->
        <ul class="space-y-6 font-mono text-sm text-white/80">
            <li class="flex gap-4">
                <span class="text-neo-green">→</span>
                <span>Paste your conversation history, prompts, or describe your year</span>
            </li>
            <li class="flex gap-4">
                <span class="text-neo-green">→</span>
                <span>The AI will analyze your vibe and create a personalized "Wrapped"</span>
            </li>
            <li class="flex gap-4">
                <span class="text-neo-green">→</span>
                <span>Scroll through your story with immersive 3D sections</span>
            </li>
            
            <li class="flex gap-4 items-center">
                <span class="text-neo-green">→</span>
                <div class="flex items-center gap-2">
                    <span>Press</span>
                    <kbd class="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs">Ctrl + Enter</kbd>
                    <span>to submit quickly</span>
                </div>
            </li>

            <li class="flex gap-4 pt-4 border-t border-white/10 text-white/50">
                <span class="text-neo-green">→</span>
                <span>You have <span class="text-white">${remaining} credits</span> remaining today</span>
            </li>
        </ul>

        <!-- Close Button (Absolute) -->
        <!-- We can just toggle with the trigger, but let's keep a close button if needed, or maybe the trigger behaves as toggle. 
             The previous design in the image likely didn't have a big X inside, maybe just clicking outside or the trigger again? 
             But for safety, let's keep a subtle close or just rely on the trigger. 
             Actually, let's add a small close icon in top right of card. -->
        <button id="close-help" class="absolute top-4 right-4 text-white/20 hover:text-white transition-colors">
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
            <h2 class="font-display text-4xl text-white">GENERATING</h2>
            <p class="font-mono text-xs text-white/50" id="loading-step">ANALYZING_YOUR_VIBE</p>
        </div>
      </div>
    `;
    
    const steps = ["READING_BETWEEN_LINES", "EXTRACTING_CHAOS", "BUILDING_TIMELINE", "RENDERING_STORY"];
    let i = 0;
    const interval = setInterval(() => {
        const el = document.getElementById('loading-step');
        if(el) el.innerText = steps[i++ % steps.length];
        else clearInterval(interval);
    }, 700);
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
                <h2 class="font-display text-5xl md:text-7xl text-neo-pink text-center mb-16">OVERARCHING INSIGHTS</h2>
                <ul class="space-y-6">
                    ${data.insights.map(ins => `<li class="text-xl md:text-2xl text-white/80 flex items-start gap-4"><span class="text-neo-green text-3xl">→</span>${ins}</li>`).join('')}
                </ul>
            </div>
        </section>
    `;

    const phrasesSection = `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative">
            <div class="max-w-4xl w-full">
                <h2 class="font-display text-5xl md:text-7xl text-neo-yellow text-center mb-16">KEY PHRASES</h2>
                <div class="flex flex-wrap justify-center gap-4">
                    ${data.keyPhrases.map(p => `<span class="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-xl text-white font-mono">"${p}"</span>`).join('')}
                </div>
            </div>
        </section>
    `;

    const statsSection = `
        <section class="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative" id="stats-section">
            <div class="max-w-5xl w-full">
                <h2 class="font-display text-5xl md:text-7xl text-neo-blue text-center mb-16">BY THE NUMBERS</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-2 gap-4">
                        ${data.stats.map((s, i) => `
                            <div class="neo-box p-6 text-center transform hover:scale-105 transition-transform">
                                <div class="text-xl md:text-4xl font-display text-white mb-2">${s.value}</div>
                                <div class="font-mono text-xs text-neo-pink uppercase">${s.label}</div>
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
            <div class="max-w-3xl w-full text-center">
                <h2 class="font-display text-6xl md:text-8xl text-white mb-8">THE VERDICT</h2>
                <p class="text-2xl md:text-3xl text-white/90 leading-relaxed font-bold">${data.finalVerdict}</p>
                <button id="reset-btn" class="neo-button mt-16">START OVER</button>
            </div>
        </section>
    `;

    app.innerHTML = `
      <div class="relative overflow-x-hidden" id="results-container">
        
        <!-- HERO -->
        <section class="min-h-screen flex flex-col items-center justify-center px-8 relative">
            <div class="text-center">
                <p class="font-mono text-xs text-neo-pink tracking-widest mb-4">${currentYear} WRAPPED</p>
                <h1 class="font-display text-6xl md:text-8xl lg:text-9xl text-white leading-none mb-4">${data.userName}</h1>
                <p class="text-xl md:text-2xl text-white/60 italic max-w-xl mx-auto">"${data.tagline}"</p>
                <div class="mt-12 animate-bounce text-white/30 font-mono text-sm">SCROLL DOWN ↓</div>
            </div>
        </section>

        ${monthSections}
        ${insightsSection}
        ${phrasesSection}
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

    document.getElementById('reset-btn').addEventListener('click', () => {
         gsap.to('#results-container', { opacity: 0, y: -20, duration: 0.5, onComplete: () => renderInputScreen(window._onSubmit) });
    });
}
