
import Chart from 'chart.js/auto';
import { createIcons, icons } from 'lucide';

const app = document.getElementById('app');

// Helper to get limit status
export function getUsageStatus() {
    const attempts = parseInt(localStorage.getItem('p2w_attempts') || '0');
    const max = 3; // Limit to 3
    return { attempts, max, remaining: max - attempts };
}

export function incrementUsage() {
    const { attempts } = getUsageStatus();
    localStorage.setItem('p2w_attempts', (attempts + 1).toString());
}

export function renderInputScreen(onSubmit) {
  const currentYear = new Date().getFullYear();
  const { remaining, max } = getUsageStatus();
  
  // Disable if limit reached
  const isLocked = remaining <= 0;

  app.innerHTML = `
    <div class="min-h-screen bg-neo-yellow flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 font-sans" id="main-container">
      
      <!-- Animated Background Elements -->
      <div class="absolute top-10 left-10 w-32 h-32 bg-neo-pink border-4 border-black rounded-full animate-bounce delay-100 opacity-20"></div>
      <div class="absolute bottom-20 right-10 w-48 h-48 bg-neo-blue border-4 border-black rotate-12 animate-pulse opacity-20"></div>
      <div class="absolute inset-0 opacity-5 pointer-events-none" style="background-image: radial-gradient(#000 2px, transparent 2px); background-size: 30px 30px;"></div>
      
      <div class="max-w-3xl w-full z-10 relative">
        
        <!-- Badge -->
        <div class="absolute -top-12 -right-6 md:-right-12 rotate-12 bg-neo-green border-4 border-black px-4 py-2 font-display text-xl shadow-neo z-20 animate-pulse">
            ${currentYear} EDITION
        </div>

        <h1 class="text-7xl md:text-9xl font-display text-neo-black mb-8 text-center drop-shadow-neo shadow-white tracking-tighter leading-none" style="text-shadow: 6px 6px 0px #fff;">
          PROMPT<br/>WRAPPED
        </h1>
        
        <div class="neo-box p-8 md:p-12 bg-neo-white transform rotate-1 transition-all duration-300 relative group">
          <div class="absolute -inset-2 bg-black -z-10 translate-x-2 translate-y-2 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform"></div>
          
          ${isLocked ? `
             <div class="text-center py-12">
                <i data-lucide="lock" class="w-24 h-24 mx-auto mb-4 text-neo-black"></i>
                <h2 class="text-3xl font-bold mb-4">YOU'VE WRAPPED IT UP.</h2>
                <p class="text-xl">You've reached your limit for today. Come back later for more vibes.</p>
             </div>
          ` : `
             <div class="mb-8">
                <label class="flex items-center justify-between font-bold mb-4 text-xl">
                    <span class="flex items-center gap-2"><i data-lucide="sparkles" class="w-6 h-6"></i> YOUR PROMPT</span>
                    <span class="text-sm bg-black text-white px-2 py-1">${remaining}/${max} CREDITS LEFT</span>
                </label>
                <textarea id="prompt-input" rows="3" class="neo-input text-3xl font-display tracking-tight resize-none" placeholder="Type something chaotic..."></textarea>
              </div>

              <button id="generate-btn" class="neo-button w-full bg-neo-pink text-2xl hover:bg-neo-blue hover:text-white transition-all group-hover:-translate-y-1 group-hover:translate-x-1 flex items-center justify-center gap-3">
                <span>WRAP MY VIBE</span>
                <i data-lucide="arrow-right" class="w-8 h-8"></i>
              </button>
          `}
        </div>
        
        <div class="mt-8 text-center font-bold text-sm opacity-50 uppercase tracking-widest">
            Powered by Gemma-3-27b &bull; OpenRouter
        </div>
      </div>
    </div>
  `;
  
  createIcons({ icons });

  if (!isLocked) {
      document.getElementById('generate-btn').addEventListener('click', () => {
        const prompt = document.getElementById('prompt-input').value;
        if (prompt) {
            onSubmit(prompt);
        } else {
            // Shake animation or visual feedback
            document.getElementById('prompt-input').focus();
        }
      });
  }
}

export function renderLoading() {
    const container = document.getElementById('main-container');
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full relative z-20">
            <div class="mb-8 animate-spin-slow">
                <i data-lucide="loader-2" class="w-32 h-32 text-neo-black"></i>
            </div>
            <h2 class="text-5xl md:text-7xl font-display text-neo-black mb-4 text-center">ANALYZING<br/>YOUR SOUL</h2>
            <div class="w-80 h-12 border-4 border-neo-black p-2 bg-white skew-x-12">
                <div class="h-full bg-neo-green animate-progress striped-bar"></div>
            </div>
            <p class="mt-8 font-bold text-2xl font-mono bg-black text-white px-4 py-1" id="loading-text">CONNECTING...</p>
        </div>
    `;
    createIcons({ icons });
    
    const texts = ["READING TEALEAVES...", "JUDGING YOUR GRAMMAR...", "CALCULATING RIZZ...", "GENERATING COLOR HEXES..."];
    let i = 0;
    const interval = setInterval(() => {
        const el = document.getElementById('loading-text');
        if(el) el.innerText = texts[i++ % texts.length];
        else clearInterval(interval);
    }, 800);
}

export function renderResults(data) {
    const currentYear = new Date().getFullYear();
    
    app.innerHTML = `
        <div class="min-h-screen bg-neo-white font-sans overflow-x-hidden selection:bg-neo-black selection:text-white">
            <!-- Header -->
            <header class="border-b-4 border-neo-black p-4 bg-white sticky top-0 z-50 flex justify-between items-center bg-opacity-90 backdrop-blur-md">
                <div class="flex items-center gap-2">
                    <i data-lucide="box" class="w-8 h-8"></i>
                    <span class="font-display text-2xl tracking-tighter">WRAPPED <span class="text-neo-pink">${currentYear}</span></span>
                </div>
                <button id="reset-btn" class="bg-neo-black text-white px-6 py-2 font-bold hover:bg-neo-yellow hover:text-black border-4 border-transparent hover:border-black transition-all flex items-center gap-2">
                    <i data-lucide="rotate-ccw" class="w-4 h-4"></i> AGAIN
                </button>
            </header>

            <main class="max-w-5xl mx-auto p-4 md:p-8 space-y-16 pb-24">
            
                <!-- Card 1: Sentiment Hero -->
                <section class="neo-box p-8 md:p-16 bg-neo-yellow transform -rotate-1 hover:rotate-0 transition-transform duration-500 relative overflow-hidden group">
                     <div class="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <i data-lucide="quote" class="w-16 h-16"></i>
                    </div>
                
                    <div class="text-center relative z-10">
                        <div class="text-[10rem] leading-none mb-6 animate-bounce filter drop-shadow-neo">${data.sentiment.emoji}</div>
                        <h2 class="text-5xl md:text-7xl font-display uppercase tracking-tighter mb-4 leading-none text-outline-white">
                            ${data.sentiment.label}
                        </h2>
                        <div class="h-4 bg-neo-black w-32 mx-auto my-8 transform -skew-x-12"></div>
                        <p class="text-2xl md:text-3xl font-bold font-sans leading-relaxed">
                            "${data.narrative}"
                        </p>
                    </div>
                </section>

                <!-- Grid Layout -->
                <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                    
                    <!-- Card 2: Stats (Linear) -->
                    <div class="neo-box p-8 bg-neo-pink rotate-1 hover:rotate-0 transition-transform lg:col-span-7">
                        <div class="flex items-center gap-3 mb-8 border-b-4 border-black pb-2">
                            <i data-lucide="bar-chart-2" class="w-8 h-8"></i>
                            <h3 class="font-display text-3xl">VITAL STATS</h3>
                        </div>
                        <div class="space-y-8">
                            ${data.stats.map(stat => `
                                <div>
                                    <div class="flex justify-between font-bold mb-2 text-xl font-mono uppercase">
                                        <span>${stat.label}</span>
                                        <span>${stat.value}/100</span>
                                    </div>
                                    <div class="h-8 border-4 border-black bg-white p-1 shadow-[4px_4px_0px_0px_kubectl#000]">
                                        <div class="h-full bg-neo-black transition-all duration-1000 relative overflow-hidden" style="width: ${stat.value}%">
                                            <div class="absolute inset-0 bg-white opacity-20" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 10px);"></div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Card 3: Palette (Vertical Stack) -->
                    <div class="neo-box p-0 bg-white -rotate-1 hover:rotate-0  lg:col-span-5 flex flex-col overflow-hidden">
                         <div class="p-6 border-b-4 border-black bg-white flex items-center gap-3">
                            <i data-lucide="palette" class="w-8 h-8"></i>
                            <h3 class="font-display text-3xl">AURA COLORS</h3>
                         </div>
                         <div class="flex-1 flex flex-col">
                            ${data.palette.map(color => `
                                <div class="flex-1 flex items-center justify-between px-6 font-mono font-bold text-xl hover:flex-[1.5] transition-all duration-300 group cursor-pointer" style="background-color: ${color}">
                                    <span class="bg-white/90 px-3 py-1 border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">${color}</span>
                                </div>
                            `).join('')}
                         </div>
                    </div>
                </section>

                <!-- Card 4: Radar Chart (Large) -->
                <section class="neo-box p-8 md:p-12 bg-neo-green relative overflow-hidden">
                    <div class="absolute top-4 left-4">
                        <i data-lucide="radar" class="w-12 h-12"></i>
                    </div>
                    <h3 class="font-display text-5xl md:text-6xl mb-8 text-center tracking-tighter">THE VIBE RADAR</h3>
                    <div class="w-full max-w-xl mx-auto aspect-square bg-white/50 border-4 border-black rounded-full overflow-hidden p-6 relative backdrop-blur-sm">
                        <canvas id="vibeChart"></canvas>
                    </div>
                </section>
                
                <footer class="text-center py-12 border-t-4 border-black mt-20 bg-neo-black text-white">
                    <div class="flex items-center justify-center gap-4 mb-4">
                        <i data-lucide="zap" class="w-6 h-6 text-neo-yellow"></i>
                        <span class="font-display text-xl">PROMPT TO WRAPPED</span>
                    </div>
                    <p class="font-mono text-sm opacity-70">MADE FOR THE INTERNET &bull; ${currentYear}</p>
                </footer>

            </main>
        </div>
    `;
    
    createIcons({ icons });
    
    // Render Chart
    const ctx = document.getElementById('vibeChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: data.graph.labels,
            datasets: [{
                label: 'Vibe Score',
                data: data.graph.data,
                backgroundColor: 'rgba(35, 160, 255, 0.6)', // neo-blue with opacity
                borderColor: '#000',
                borderWidth: 4,
                pointBackgroundColor: '#ffc900', // neo-yellow
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
                        font: { family: '"Lexend Mega"', size: 14, weight: 'bold' },
                        color: '#000',
                        padding: 20
                    },
                    ticks: { display: false, maxTicksLimit: 5, backdropColor: 'transparent' },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { display: false }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutElastic'
            }
        }
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        renderInputScreen(window._onSubmit);
    });
}
