import Chart from 'chart.js/auto';
import { createIcons, icons } from 'lucide';
import gsap from 'gsap';

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
        
        <!-- GIANT TITLE -->
        <div class="text-center mb-12 perspective-1000">
           <h1 class="font-display text-8xl md:text-[10rem] lg:text-[12rem] leading-none tracking-tighter text-transparent bg-clip-text bg-white opacity-0" id="title-prompt" style="-webkit-text-stroke: 2px white;">PROMPT</h1>
           <h1 class="font-display text-8xl md:text-[10rem] lg:text-[12rem] leading-none tracking-tighter text-white mix-blend-overlay opacity-0" id="title-wrapped">WRAPPED</h1>
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
               <label class="block font-mono text-xs text-neo-pink mb-4 tracking-widest">INPUT_TERMINAL_V2 :: READY</label>
               <textarea 
                 id="prompt-input" 
                 rows="3" 
                 class="neo-input bg-transparent border-none text-3xl md:text-4xl text-white font-bold placeholder:text-white/20 focus:ring-0 resize-none leading-tight" 
                 placeholder="TYPE_YOUR_PROMPT_HERE..."></textarea>
               
               <div class="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                 <div class="flex items-center gap-4 text-xs font-mono text-white/40">
                    <span>${remaining}/${max} CREDITS</span>
                    <span>::</span>
                    <span>AI_MODEL_LOADING</span>
                 </div>
                 <button id="generate-btn" class="neo-button group">
                    <span class="relative z-10 group-hover:text-black">INITIALIZE</span>
                 </button>
               </div>
             `}
          </div>
        </div>

      </div>
      
      <!-- FOOTER -->
      <div class="fixed bottom-4 right-4 z-40">
        <div class="font-mono text-xs text-white/30 text-right">
          <p>SYSTEM_STATUS: ONLINE</p>
          <p>RENDERER: WEBGL</p>
        </div>
      </div>

    </div>
  `;

  createIcons({ icons });

  // GSAP Animations
  const tl = gsap.timeline();
  
  tl.to('#title-prompt', { opacity: 1, duration: 0.1, delay: 0.2 })
    .to('#title-prompt', { opacity: 0.2, duration: 0.05 })
    .to('#title-prompt', { opacity: 1, duration: 0.05 })
    .to('#title-prompt', { y: 0, duration: 1, ease: 'power4.out' }, "-=0.2")
    
    .to('#title-wrapped', { opacity: 1, duration: 0.1 }, "-=0.5")
    .from('#title-wrapped', { x: -50, filter: 'blur(10px)', duration: 0.8 }, "-=0.4")
    
    .to('#input-card', { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }, "-=0.2");

  if (!isLocked) {
    const btn = document.getElementById('generate-btn');
    const input = document.getElementById('prompt-input');

    btn.addEventListener('mouseenter', () => {
        gsap.to(btn, { scale: 1.05, duration: 0.2 });
    });
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { scale: 1, duration: 0.2 });
    });

    btn.addEventListener('click', () => {
      const val = input.value.trim();
      if (val) {
        // Exit animation
        gsap.to('#main-container', { scale: 1.1, opacity: 0, filter: 'blur(20px)', duration: 0.5, onComplete: () => onSubmit(val) });
      } else {
        gsap.fromTo(input, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
      }
    });

    // Enter key support
    input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            btn.click();
        }
    });
  }
}

export function renderLoading() {
    // Keep existing visual structure for loading or upgrade it? Let's upgrade it to be minimal.
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center z-50 relative">
        <div class="text-center space-y-8">
            <div class="relative w-32 h-32 mx-auto">
                <div class="absolute inset-0 border-4 border-neo-pink rounded-full border-t-transparent animate-spin"></div>
                <div class="absolute inset-2 border-4 border-neo-blue rounded-full border-b-transparent animate-spin-slow"></div>
            </div>
            <h2 class="font-display text-4xl text-white glitch-text" data-text="PROCESSING">PROCESSING</h2>
            <div class="w-64 h-1 bg-white/20 mx-auto overflow-hidden">
                <div class="h-full bg-neo-green w-0" id="progress-bar"></div>
            </div>
            <p class="font-mono text-xs text-white/50" id="loading-step">INITIALIZING_NEURAL_NET</p>
        </div>
      </div>
    `;

    gsap.to('#progress-bar', { width: '100%', duration: 4, ease: 'power1.inOut' });
    
    const steps = ["ANALYZING_SEMANTICS", "EXTRACTING_VIBES", "GENERATING_PALETTE", "RENDERING_OUTPUT"];
    let i = 0;
    setInterval(() => {
        if(i < steps.length) {
            document.getElementById('loading-step').innerText = steps[i++];
        }
    }, 800);
}

export function renderResults(data) {
    const currentYear = new Date().getFullYear();

    app.innerHTML = `
      <div class="min-h-screen relative overflow-hidden flex flex-col pt-20 pb-12 px-4 md:px-8">
        
        <!-- HEADER -->
        <header class="fixed top-0 left-0 w-full z-40 bg-black/50 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center">
             <div class="font-display text-xl text-white">WRAPPED <span class="text-neo-pink">${currentYear}</span></div>
             <button id="reset-btn" class="neo-button px-4 py-2 text-sm !border-white/20">RESTART</button>
        </header>

        <!-- CONTENT GRID -->
        <main class="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
            
            <!-- SENTIMENT CARD (HERO) -->
            <div class="col-span-1 md:col-span-8 neo-box p-8 md:p-16 flex flex-col justify-center items-start min-h-[400px] opacity-0" id="card-hero">
                <div class="font-mono text-xs text-neo-pink mb-2">OVERALL_VIBE</div>
                <h2 class="font-display text-6xl md:text-8xl leading-none mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neo-yellow to-neo-pink">
                    ${data.sentiment.label}
                </h2>
                <p class="text-xl md:text-2xl font-bold text-white/80 max-w-2xl leading-relaxed">
                    "${data.narrative}"
                </p>
                <div class="absolute right-8 top-8 text-8xl opacity-20 rotate-12">${data.sentiment.emoji}</div>
            </div>

            <!-- STATS COLUMN -->
            <div class="col-span-1 md:col-span-4 space-y-6">
                <!-- PALETTE -->
                <div class="neo-box p-6 opacity-0" id="card-palette">
                    <div class="font-mono text-xs text-white/50 mb-4">COLOR_PALETTE</div>
                    <div class="flex flex-col gap-2">
                        ${data.palette.map(c => `
                            <div class="h-12 w-full flex items-center px-4 font-mono text-xs font-bold text-black hover:scale-105 transition-transform origin-left cursor-help" style="background-color: ${c}">
                                ${c}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- RADAR -->
                <div class="neo-box p-6 aspect-square opacity-0 bg-black/80" id="card-radar">
                     <canvas id="vibeChart"></canvas>
                </div>
            </div>

            <!-- DETAILED STATS (WIDE) -->
            <div class="col-span-1 md:col-span-12 neo-box p-8 opacity-0" id="card-stats">
                 <div class="font-mono text-xs text-white/50 mb-6 border-b border-white/10 pb-2">VITAL_STATISTICS</div>
                 <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    ${data.stats.map(s => `
                        <div>
                            <div class="text-4xl font-display text-white mb-2">${s.value}%</div>
                            <div class="font-mono text-xs text-neo-pink uppercase">${s.label}</div>
                            <div class="h-1 w-full bg-white/10 mt-2">
                                <div class="h-full bg-neo-blue" style="width: ${s.value}%"></div>
                            </div>
                        </div>
                    `).join('')}
                 </div>
            </div>
        </main>

      </div>
    `;
    
    createIcons({ icons });

    // Chart
    const ctx = document.getElementById('vibeChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: data.graph.labels,
            datasets: [{
                label: 'Vibe',
                data: data.graph.data,
                backgroundColor: 'rgba(255, 144, 232, 0.2)',
                borderColor: '#FF90E8',
                pointBackgroundColor: '#fff',
                pointBorderColor: '#FF90E8'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: 'rgba(255,255,255,0.7)', font: { family: 'Space Mono', size: 10 } },
                    ticks: { display: false, backdropColor: 'transparent' }
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // Animations
    const tl = gsap.timeline();
    tl.to('#card-hero', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('#card-palette', { opacity: 1, x: 0, duration: 0.6 }, "-=0.4")
      .to('#card-radar', { opacity: 1, x: 0, duration: 0.6 }, "-=0.4")
      .to('#card-stats', { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");

    document.getElementById('reset-btn').addEventListener('click', () => {
         gsap.to('main', { opacity: 0, y: -20, duration: 0.5, onComplete: () => renderInputScreen(window._onSubmit) });
    });
}
