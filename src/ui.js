
import Chart from 'chart.js/auto';
import { createIcons, icons } from 'lucide';

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

// Cursor blob effect
function initCursorBlob() {
    const blob = document.getElementById('cursor-blob');
    if (!blob) return;
    
    document.addEventListener('mousemove', (e) => {
        blob.style.left = e.clientX + 'px';
        blob.style.top = e.clientY + 'px';
    });
}

export function renderInputScreen(onSubmit) {
  const currentYear = new Date().getFullYear();
  const { remaining, max } = getUsageStatus();
  const isLocked = remaining <= 0;

  const marqueeText = "YOUR PROMPTS DESERVE A GLOW-UP • WRAP YOUR VIBE • AI-POWERED AESTHETICS • ";

  app.innerHTML = `
    <!-- Cursor blob effect -->
    <div id="cursor-blob" class="cursor-blob hidden md:block"></div>

    <div class="min-h-screen relative overflow-hidden noise-overlay" id="main-container">
      
      <!-- Animated gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br from-neo-yellow via-neo-pink to-neo-blue animate-gradient opacity-80"></div>
      
      <!-- Grid overlay -->
      <div class="absolute inset-0 dot-pattern opacity-10"></div>
      
      <!-- Floating shapes -->
      <div class="absolute top-[10%] left-[5%] w-24 h-24 md:w-40 md:h-40 bg-neo-green border-4 border-black rotate-12 animate-float-slow shadow-neo-lg"></div>
      <div class="absolute top-[20%] right-[8%] w-20 h-20 md:w-32 md:h-32 bg-neo-pink border-4 border-black rounded-full animate-float shadow-neo"></div>
      <div class="absolute bottom-[15%] left-[10%] w-16 h-16 md:w-28 md:h-28 bg-neo-blue border-4 border-black animate-float-reverse shadow-neo"></div>
      <div class="absolute bottom-[25%] right-[5%] w-24 h-24 md:w-36 md:h-36 bg-neo-yellow border-4 border-black rotate-45 animate-float-slow shadow-neo-lg"></div>
      <div class="absolute top-[50%] left-[50%] w-64 h-64 border-4 border-black/10 rounded-full animate-spin-slow"></div>
      
      <!-- Decorative corner stamps -->
      <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 font-mono text-xs tracking-widest z-20">
        <i data-lucide="terminal" class="w-3 h-3 inline-block mr-1"></i>P2W_V1.0
      </div>
      <div class="absolute top-4 right-4 bg-neo-green border-2 border-black px-3 py-1 font-mono text-xs tracking-widest z-20 rotate-3 shadow-neo">
        ${currentYear} EDITION
      </div>
      
      <!-- Main content -->
      <div class="relative z-10 min-h-screen flex flex-col">
        
        <!-- Marquee banner -->
        <div class="bg-neo-black text-white py-3 border-b-4 border-neo-yellow overflow-hidden">
          <div class="animate-marquee whitespace-nowrap flex">
            <span class="font-mono text-sm tracking-widest mx-4">${marqueeText.repeat(5)}</span>
          </div>
        </div>
        
        <!-- Hero section -->
        <div class="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          
          <div class="max-w-4xl w-full text-center mb-8 md:mb-12">
            <!-- Main title with glitch -->
            <h1 class="glitch-text text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-display text-neo-black leading-none tracking-tighter mb-4" data-text="PROMPT">
              PROMPT
            </h1>
            <h1 class="glitch-text text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-display text-neo-black leading-none tracking-tighter" data-text="WRAPPED">
              WRAPPED
            </h1>
            
            <p class="mt-6 md:mt-8 text-lg md:text-2xl font-bold text-neo-black/80 max-w-xl mx-auto animate-slide-up delay-300">
              <i data-lucide="sparkles" class="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 text-neo-pink"></i>
              Turn your prompts into visual masterpieces
            </p>
          </div>
          
          <!-- Input Card -->
          <div class="w-full max-w-2xl px-4 animate-slide-up delay-400">
            <div class="neo-box p-6 md:p-10 bg-white/95 backdrop-blur-sm hover-lift relative group">
              <!-- Decorative badge -->
              <div class="absolute -top-4 -right-4 bg-neo-pink border-4 border-black px-4 py-2 font-display text-sm rotate-6 shadow-neo animate-pulse-glow">
                <i data-lucide="wand-2" class="w-4 h-4 inline-block mr-1"></i>
                MAGIC TIME
              </div>
              
              ${isLocked ? `
                <div class="text-center py-8 md:py-12">
                  <div class="w-20 h-20 md:w-28 md:h-28 mx-auto mb-6 bg-neo-black rounded-full flex items-center justify-center animate-pulse">
                    <i data-lucide="lock" class="w-10 h-10 md:w-14 md:h-14 text-white"></i>
                  </div>
                  <h2 class="text-2xl md:text-4xl font-display mb-4">LIMIT REACHED</h2>
                  <p class="text-lg md:text-xl opacity-70">You've used all your wraps. Come back tomorrow!</p>
                  <div class="mt-6 flex items-center justify-center gap-2 text-sm font-mono opacity-50">
                    <i data-lucide="clock" class="w-4 h-4"></i>
                    Resets in 24 hours
                  </div>
                </div>
              ` : `
                <div class="mb-6">
                  <div class="flex items-center justify-between mb-4">
                    <label class="flex items-center gap-2 font-bold text-lg md:text-xl">
                      <i data-lucide="message-square" class="w-5 h-5 md:w-6 md:h-6"></i>
                      DROP YOUR PROMPT
                    </label>
                    <span class="flex items-center gap-1 text-xs md:text-sm font-mono bg-neo-black text-white px-2 md:px-3 py-1">
                      <i data-lucide="zap" class="w-3 h-3 md:w-4 md:h-4 text-neo-yellow"></i>
                      ${remaining}/${max}
                    </span>
                  </div>
                  <textarea 
                    id="prompt-input" 
                    rows="4" 
                    class="neo-input text-xl md:text-2xl font-sans tracking-tight resize-none transition-all focus:scale-[1.01] focus:shadow-neo-lg" 
                    placeholder="Describe your wildest idea, paste your favorite prompt, or just type something chaotic...">
                  </textarea>
                </div>

                <button id="generate-btn" class="neo-button w-full bg-gradient-to-r from-neo-pink to-neo-blue text-xl md:text-2xl py-4 md:py-5 hover:from-neo-blue hover:to-neo-green transition-all group flex items-center justify-center gap-3 relative overflow-hidden">
                  <span class="relative z-10 flex items-center gap-3">
                    <i data-lucide="sparkles" class="w-6 h-6 md:w-8 md:h-8 group-hover:animate-spin"></i>
                    GENERATE MY WRAPPED
                    <i data-lucide="arrow-right" class="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform"></i>
                  </span>
                </button>

                <div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm font-mono opacity-60">
                  <span class="flex items-center gap-1"><i data-lucide="cpu" class="w-3 h-3"></i> Gemma-3-27B</span>
                  <span class="flex items-center gap-1"><i data-lucide="palette" class="w-3 h-3"></i> AI Colors</span>
                  <span class="flex items-center gap-1"><i data-lucide="bar-chart" class="w-3 h-3"></i> Vibe Stats</span>
                </div>
              `}
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <footer class="relative z-10 bg-neo-black text-white py-4 border-t-4 border-white">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto px-4">
            <div class="flex items-center gap-4">
              <span class="font-display text-lg">P2W</span>
              <span class="text-xs font-mono opacity-60">PROMPT TO WRAPPED</span>
            </div>
            <div class="flex items-center gap-6 text-xs font-mono opacity-60">
              <span class="flex items-center gap-1">
                <i data-lucide="github" class="w-4 h-4"></i> Open Source
              </span>
              <span>&copy; ${currentYear}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `;

  createIcons({ icons });
  initCursorBlob();

  if (!isLocked) {
    document.getElementById('generate-btn').addEventListener('click', () => {
      const prompt = document.getElementById('prompt-input').value.trim();
      if (prompt) {
        onSubmit(prompt);
      } else {
        const input = document.getElementById('prompt-input');
        input.classList.add('animate-shake');
        input.focus();
        setTimeout(() => input.classList.remove('animate-shake'), 500);
      }
    });
  }
}

export function renderLoading() {
    const container = document.getElementById('main-container');
    container.innerHTML = `
      <div class="absolute inset-0 bg-gradient-to-br from-neo-black via-neo-blue to-neo-pink animate-gradient"></div>
      <div class="absolute inset-0 dot-pattern opacity-5"></div>
      
      <div class="relative z-10 flex flex-col items-center justify-center h-full min-h-screen p-8 text-white">
        <div class="mb-8 relative">
          <div class="w-32 h-32 md:w-48 md:h-48 border-8 border-white rounded-full animate-spin-slow"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <i data-lucide="brain" class="w-16 h-16 md:w-24 md:h-24 animate-pulse"></i>
          </div>
        </div>
        
        <h2 class="text-4xl md:text-7xl font-display mb-4 text-center glitch-text" data-text="ANALYZING">ANALYZING</h2>
        <h2 class="text-4xl md:text-7xl font-display mb-8 text-center text-neo-yellow">YOUR VIBE</h2>
        
        <div class="w-full max-w-md">
          <div class="h-6 border-4 border-white bg-white/10 overflow-hidden">
            <div class="h-full bg-neo-green striped-bar animate-progress" style="width: 100%"></div>
          </div>
        </div>
        
        <p class="mt-8 font-mono text-lg md:text-xl bg-white/10 px-6 py-2 border border-white/30" id="loading-text">INITIALIZING...</p>
      </div>
    `;
    createIcons({ icons });

    const texts = [
      "READING YOUR ENERGY...",
      "EXTRACTING CHAOS LEVELS...",
      "COMPUTING CREATIVITY SCORE...",
      "GENERATING PALETTE...",
      "ANALYZING SENTIMENT...",
      "BUILDING YOUR WRAPPED..."
    ];
    let i = 0;
    const interval = setInterval(() => {
        const el = document.getElementById('loading-text');
        if (el) el.innerText = texts[i++ % texts.length];
        else clearInterval(interval);
    }, 700);
}

export function renderResults(data) {
    const currentYear = new Date().getFullYear();

    app.innerHTML = `
      <div id="cursor-blob" class="cursor-blob hidden md:block"></div>
      
      <div class="min-h-screen bg-neo-white font-sans overflow-x-hidden noise-overlay">
        
        <!-- Sticky Header -->
        <header class="border-b-4 border-neo-black p-4 bg-white/95 backdrop-blur-md sticky top-0 z-50">
          <div class="max-w-6xl mx-auto flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-neo-black flex items-center justify-center">
                <i data-lucide="box" class="w-6 h-6 text-white"></i>
              </div>
              <span class="font-display text-xl md:text-2xl tracking-tighter">
                WRAPPED <span class="text-neo-pink">${currentYear}</span>
              </span>
            </div>
            <button id="reset-btn" class="neo-button bg-neo-green text-sm md:text-base flex items-center gap-2">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              NEW WRAP
            </button>
          </div>
        </header>

        <main class="max-w-5xl mx-auto p-4 md:p-8 space-y-12 md:space-y-20 pb-24">

          <!-- Hero Card: Sentiment -->
          <section class="neo-box p-8 md:p-16 bg-gradient-to-br from-neo-yellow to-neo-pink transform -rotate-1 hover:rotate-0 transition-transform duration-500 relative overflow-hidden animate-slide-up">
            <div class="absolute top-4 right-4 opacity-30">
              <i data-lucide="quote" class="w-20 h-20 md:w-32 md:h-32"></i>
            </div>
            
            <div class="text-center relative z-10">
              <div class="text-8xl md:text-[12rem] leading-none mb-6 drop-shadow-lg">${data.sentiment.emoji}</div>
              <h2 class="text-4xl md:text-7xl font-display uppercase tracking-tighter mb-6 leading-none">
                ${data.sentiment.label}
              </h2>
              <div class="h-2 bg-neo-black w-24 mx-auto mb-6"></div>
              <p class="text-xl md:text-3xl font-bold leading-relaxed max-w-2xl mx-auto">
                "${data.narrative}"
              </p>
            </div>
          </section>

          <!-- Stats Grid -->
          <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            <!-- Stats Card -->
            <div class="neo-box p-6 md:p-8 bg-white lg:col-span-7 animate-slide-up delay-100">
              <div class="flex items-center gap-3 mb-6 md:mb-8 border-b-4 border-black pb-3">
                <i data-lucide="activity" class="w-8 h-8"></i>
                <h3 class="font-display text-2xl md:text-3xl">VITAL STATS</h3>
              </div>
              <div class="space-y-6 md:space-y-8">
                ${data.stats.map((stat, index) => `
                  <div class="animate-slide-in-left" style="animation-delay: ${index * 100}ms">
                    <div class="flex justify-between font-bold mb-2 text-lg md:text-xl font-mono uppercase">
                      <span>${stat.label}</span>
                      <span class="text-neo-pink">${stat.value}%</span>
                    </div>
                    <div class="h-6 md:h-8 border-4 border-black bg-white p-1 relative overflow-hidden">
                      <div class="h-full bg-neo-black striped-bar transition-all duration-1000" style="width: ${stat.value}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Palette Card -->
            <div class="neo-box p-0 bg-white lg:col-span-5 flex flex-col overflow-hidden animate-slide-up delay-200">
              <div class="p-4 md:p-6 border-b-4 border-black flex items-center gap-3">
                <i data-lucide="palette" class="w-8 h-8"></i>
                <h3 class="font-display text-2xl md:text-3xl">YOUR COLORS</h3>
              </div>
              <div class="flex-1 flex flex-col">
                ${data.palette.map(color => `
                  <div class="flex-1 min-h-16 flex items-center justify-between px-6 font-mono font-bold text-lg hover:flex-[1.8] transition-all duration-300 group cursor-pointer border-b-2 last:border-b-0 border-black/10" style="background-color: ${color}">
                    <span class="bg-white/95 px-3 py-1 border-2 border-black opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-neo">${color}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>

          <!-- Radar Chart -->
          <section class="neo-box p-6 md:p-12 bg-neo-green relative overflow-hidden animate-slide-up delay-300">
            <div class="absolute top-4 left-4">
              <i data-lucide="radar" class="w-12 h-12 opacity-50"></i>
            </div>
            <h3 class="font-display text-4xl md:text-6xl mb-8 text-center tracking-tighter">VIBE RADAR</h3>
            <div class="w-full max-w-lg mx-auto aspect-square bg-white/80 border-4 border-black rounded-full overflow-hidden p-4 md:p-8 backdrop-blur-sm">
              <canvas id="vibeChart"></canvas>
            </div>
          </section>

        </main>
        
        <!-- Footer -->
        <footer class="bg-neo-black text-white py-8 border-t-4 border-white">
          <div class="max-w-6xl mx-auto px-4 text-center">
            <div class="flex items-center justify-center gap-4 mb-4">
              <i data-lucide="zap" class="w-6 h-6 text-neo-yellow"></i>
              <span class="font-display text-xl">PROMPT TO WRAPPED</span>
            </div>
            <p class="font-mono text-sm opacity-60">MADE WITH AI • ${currentYear}</p>
          </div>
        </footer>
      </div>
    `;

    createIcons({ icons });
    initCursorBlob();

    // Render Chart
    const ctx = document.getElementById('vibeChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: data.graph.labels,
            datasets: [{
                label: 'Vibe Score',
                data: data.graph.data,
                backgroundColor: 'rgba(35, 160, 255, 0.5)',
                borderColor: '#000',
                borderWidth: 4,
                pointBackgroundColor: '#ffc900',
                pointBorderColor: '#000',
                pointBorderWidth: 3,
                pointRadius: 8,
                pointHoverRadius: 12,
                pointHoverBackgroundColor: '#ff90e8'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: { color: '#000', lineWidth: 2 },
                    grid: { color: '#000', lineWidth: 1 },
                    pointLabels: {
                        font: { family: '"Lexend Mega"', size: 12, weight: 'bold' },
                        color: '#000',
                        padding: 15
                    },
                    ticks: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: { legend: { display: false } },
            animation: { duration: 2000, easing: 'easeInOutElastic' }
        }
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        renderInputScreen(window._onSubmit);
    });
}
