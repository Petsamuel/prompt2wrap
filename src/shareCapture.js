/**
 * Share Capture Module
 * Handles recording animated "Highlight Reel" as WebM video or GIF
 */

import gsap from 'gsap';
import { createIcons, icons } from 'lucide';

// ============================================
// CONSTANTS
// ============================================
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const FPS = 30;
const TOTAL_DURATION = 30000; // 30 seconds in ms - extended for more content

// Color palette matching the app
const COLORS = {
    bg: '#050505',
    pink: '#FF90E8',
    blue: '#23A0FF',
    green: '#00FF94',
    yellow: '#FFC900',
    white: '#FFFFFF',
    dimWhite: 'rgba(255,255,255,0.6)'
};

// Font fallbacks for canvas rendering
const FONTS = {
    display: '"Bebas Neue", "Arial Black", Impact, sans-serif',
    mono: '"Space Mono", "Courier New", monospace',
    body: '"Inter", Arial, Helvetica, sans-serif'
};

// ============================================
// HIGHLIGHT REEL CLASS
// ============================================
export class HighlightReel {
    constructor(data) {
        this.data = data;
        this.canvas = document.createElement('canvas');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.ctx = this.canvas.getContext('2d');
        
        this.startTime = 0;
        this.isPlaying = false;
        this.onFrameCallback = null;
        this.onCompleteCallback = null;
        
        // Animation state
        this.state = {
            phase: 'intro', // intro, months, stats, verdict
            progress: 0,
            opacity: 1
        };
    }
    
    /**
     * Start the highlight reel animation
     */
    async play(onFrame, onComplete) {
        this.onFrameCallback = onFrame;
        this.onCompleteCallback = onComplete;
        this.isPlaying = true;
        this.startTime = performance.now();
        
        this.animate(performance.now());
    }
    
    /**
     * Stop the animation
     */
    stop() {
        this.isPlaying = false;
    }
    
    /**
     * Main animation loop using timestamp-based progress
     */
    animate(timestamp) {
        if (!this.isPlaying) return;
        
        const elapsed = timestamp - this.startTime;
        const progress = Math.min(elapsed / TOTAL_DURATION, 1);
        
        // Clear canvas
        this.ctx.fillStyle = COLORS.bg;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw animated particles background
        this.drawParticles(elapsed);
        
        // Determine phase and render (adjusted for 30s duration)
        if (progress < 0.1) {
            // Intro: 0-3s (0-10%)
            this.renderIntro(progress / 0.1);
        } else if (progress < 0.5) {
            // Months: 3-15s (10-50%)
            this.renderMonths((progress - 0.1) / 0.4);
        } else if (progress < 0.7) {
            // Stats: 15-21s (50-70%)
            this.renderStats((progress - 0.5) / 0.2);
        } else {
            // Your Moment: 21-30s (70-100%)
            this.renderVerdict((progress - 0.7) / 0.3);
        }
        
        // Draw watermark
        this.drawWatermark();
        
        // Callback with current frame
        if (this.onFrameCallback) {
            this.onFrameCallback(this.canvas, progress);
        }
        
        if (progress < 1) {
            requestAnimationFrame((t) => this.animate(t));
        } else {
            this.isPlaying = false;
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
        }
    }
    
    /**
     * Draw animated particle background
     */
    drawParticles(elapsed) {
        const particleCount = 100;
        const time = elapsed / 1000;
        
        this.ctx.save();
        for (let i = 0; i < particleCount; i++) {
            const seed = i * 1337;
            const x = (Math.sin(seed) * 0.5 + 0.5) * CANVAS_WIDTH;
            const y = ((Math.cos(seed * 0.7) * 0.5 + 0.5) * CANVAS_HEIGHT + time * 20 * (i % 3 + 1)) % CANVAS_HEIGHT;
            const size = (i % 4) + 1;
            const alpha = 0.1 + (Math.sin(time + i) * 0.5 + 0.5) * 0.3;
            
            const colors = [COLORS.pink, COLORS.blue, COLORS.green, COLORS.yellow];
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }
    
    /**
     * Render intro phase: Username + Tagline
     */
    renderIntro(progress) {
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        
        // Animate scale and opacity
        const scale = 0.5 + progress * 0.5;
        const opacity = Math.min(progress * 2, 1);
        
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);
        
        // Year badge
        this.ctx.fillStyle = COLORS.pink;
        this.ctx.font = 'bold 24px "Space Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${new Date().getFullYear()} WRAPPED`, 0, -120);
        
        // Username
        this.ctx.fillStyle = COLORS.white;
        this.ctx.font = 'bold 120px "Bebas Neue", sans-serif';
        this.ctx.fillText(this.data.userName || 'YOUR YEAR', 0, 20);
        
        // Tagline
        this.ctx.fillStyle = COLORS.dimWhite;
        this.ctx.font = 'italic 32px "Inter", sans-serif';
        this.ctx.fillText(`"${this.data.tagline || ''}"`, 0, 100);
        
        this.ctx.restore();
    }
    
    /**
     * Render months phase: Top 3 months carousel
     */
    /**
     * Render months phase: Top 3 months carousel
     */
    renderMonths(progress) {
        const months = this.data.months?.slice(0, 3) || [];
        if (months.length === 0) return;
        
        // Calculate which month to show (each gets 1/3 of the time)
        const monthIndex = Math.min(Math.floor(progress * 3), 2);
        const monthProgress = (progress * 3) % 1;
        
        const month = months[monthIndex];
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        
        // Slide transition
        const slideOffset = monthProgress < 0.1 ? (1 - monthProgress / 0.1) * 200 : 0;
        const fadeIn = Math.min(monthProgress / 0.1, 1);
        const fadeOut = monthProgress > 0.9 ? 1 - (monthProgress - 0.9) / 0.1 : 1;
        const opacity = fadeIn * fadeOut;
        
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.translate(centerX + slideOffset, centerY);
        
        // Month number badge
        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        this.ctx.beginPath();
        this.ctx.arc(0, -80, 60, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw Icon
        const iconName = month.iconName;
        if (iconName) {
            this.drawIcon(iconName, 0, -80, 40, COLORS.pink);
        } else {
            // Fallback
            this.ctx.fillStyle = COLORS.pink;
            this.ctx.font = 'bold 28px "Space Mono", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('✦', 0, -70);
        }
        
        // Month name
        this.ctx.fillStyle = COLORS.white;
        this.ctx.font = 'bold 100px "Bebas Neue", sans-serif';
        this.ctx.textAlign = 'center'; // Ensure text align is reset/set
        this.ctx.fillText(month.name?.toUpperCase() || '', 0, 40);
        
        // Month title
        this.ctx.fillStyle = COLORS.pink;
        this.ctx.font = 'italic 36px "Inter", sans-serif';
        this.ctx.fillText(`"${month.title || ''}"`, 0, 100);
        
        // Month content (truncated)
        this.ctx.fillStyle = COLORS.dimWhite;
        this.ctx.font = '24px "Inter", sans-serif';
        const content = month.content || '';
        const truncated = content.length > 80 ? content.substring(0, 80) + '...' : content;
        this.wrapText(truncated, 0, 160, 800, 32);
        
        // Mood badge
        // this.ctx.fillStyle = 'rgba(255,144,232,0.2)';
        // this.roundRect(-80, 200, 160, 40, 20);
        this.ctx.fill();
        this.ctx.fillStyle = COLORS.white;
        this.ctx.font = '18px "Space Mono", monospace';
        this.ctx.textAlign = 'center'; // Re-confirm alignment
        this.ctx.fillText(`Mood: ${month.mood || 'vibing'}`, 0, 227);
        
        this.ctx.restore();
        
        // Progress dots
        this.drawProgressDots(monthIndex, 3);
    }
    
    /**
     * Draw Lucide icon on canvas
     */
    drawIcon(name, x, y, size, color) {
        // Convert kebab-case (calendar-days) to PascalCase (CalendarDays)
        const pascalName = name.split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
            
        // Handle edge cases or specific icon mappings if needed
        // Assuming 'icons' is imported from lucide
        const iconDef = icons[pascalName] || icons[Object.keys(icons).find(k => k.toLowerCase() === pascalName.toLowerCase())];
        
        if (!iconDef) {
            // Debug text if icon not found
            this.ctx.fillStyle = color;
            this.ctx.font = '12px sans-serif';
            this.ctx.fillText(name, x, y);
            return;
        }

        this.ctx.save();
        this.ctx.translate(x - size/2, y - size/2);
        this.ctx.scale(size / 24, size / 24); // Lucide icons are 24x24 base
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        iconDef.forEach(([tag, attrs]) => {
            if (tag === 'path') {
                const path = new Path2D(attrs.d);
                this.ctx.stroke(path);
            } else if (tag === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(parseFloat(attrs.cx), parseFloat(attrs.cy), parseFloat(attrs.r), 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (tag === 'rect') {
                this.ctx.beginPath();
                const rx = attrs.rx ? parseFloat(attrs.rx) : 0;
                if (rx > 0) {
                     this.ctx.roundRect(parseFloat(attrs.x), parseFloat(attrs.y), parseFloat(attrs.width), parseFloat(attrs.height), rx);
                } else {
                     this.ctx.rect(parseFloat(attrs.x), parseFloat(attrs.y), parseFloat(attrs.width), parseFloat(attrs.height));
                }
                this.ctx.stroke();
            } else if (tag === 'line') {
                this.ctx.beginPath();
                this.ctx.moveTo(parseFloat(attrs.x1), parseFloat(attrs.y1));
                this.ctx.lineTo(parseFloat(attrs.x2), parseFloat(attrs.y2));
                this.ctx.stroke();
            } else if (tag === 'polyline') {
                const points = attrs.points.trim().split(/\s+/);
                this.ctx.beginPath();
                const [firstX, firstY] = points[0].split(',').map(Number);
                this.ctx.moveTo(firstX, firstY);
                for (let i = 1; i < points.length; i++) {
                    const [px, py] = points[i].split(',').map(Number);
                    this.ctx.lineTo(px, py);
                }
                this.ctx.stroke();
            } else if (tag === 'polygon') {
                 const points = attrs.points.trim().split(/\s+/);
                this.ctx.beginPath();
                const [firstX, firstY] = points[0].split(',').map(Number);
                this.ctx.moveTo(firstX, firstY);
                for (let i = 1; i < points.length; i++) {
                    const [px, py] = points[i].split(',').map(Number);
                    this.ctx.lineTo(px, py);
                }
                this.ctx.closePath();
                this.ctx.stroke();
            }
        });
        
        this.ctx.restore();
    }
    
    // ... existing renderStats, renderVerdict, drawProgressDots, drawWatermark, wrapText, roundRect, getCanvas ...

    renderStats(progress) {
        const stats = this.data.stats?.slice(0, 4) || [];
        const centerX = CANVAS_WIDTH / 2;
        
        this.ctx.save();
        
        // Title
        const titleOpacity = Math.min(progress * 3, 1);
        this.ctx.globalAlpha = titleOpacity;
        this.ctx.fillStyle = COLORS.blue;
        this.ctx.font = `bold 80px ${FONTS.display}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('YOUR NUMBERS', centerX, 200);
        
        // Stats grid - larger cards with better spacing
        const gridStartY = 280;
        const gridCols = 2;
        const cellWidth = 450;
        const cellHeight = 250;
        const gridStartX = centerX - cellWidth;
        const cardWidth = 380;
        const cardHeight = 180;
        
        stats.forEach((stat, i) => {
            const row = Math.floor(i / gridCols);
            const col = i % gridCols;
            const x = gridStartX + col * cellWidth + cellWidth / 2;
            const y = gridStartY + row * cellHeight;
            
            // Stagger animation
            const delay = i * 0.15;
            const statProgress = Math.max(0, Math.min((progress - delay) / 0.3, 1));
            
            if (statProgress > 0) {
                this.ctx.globalAlpha = statProgress;
                
                // Card background - larger
                this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
                this.roundRect(x - cardWidth/2, y - 20, cardWidth, cardHeight, 15);
                this.ctx.fill();
                
                // Value - fit text to card width
                const value = stat.value || '0';
                this.ctx.fillStyle = COLORS.white;
                
                // Auto-size font based on text length
                let fontSize = 48;
                if (value.length > 20) fontSize = 28;
                else if (value.length > 15) fontSize = 32;
                else if (value.length > 10) fontSize = 38;
                
                this.ctx.font = `bold ${fontSize}px ${FONTS.display}`;
                this.ctx.textAlign = 'center';
                
                // Wrap long text to fit card
                const maxWidth = cardWidth - 40;
                if (this.ctx.measureText(value).width > maxWidth) {
                    // Split into two lines
                    const words = value.split(' ');
                    let line1 = '';
                    let line2 = '';
                    for (const word of words) {
                        if (this.ctx.measureText(line1 + ' ' + word).width < maxWidth) {
                            line1 += (line1 ? ' ' : '') + word;
                        } else {
                            line2 += (line2 ? ' ' : '') + word;
                        }
                    }
                    this.ctx.fillText(line1, x, y + 50);
                    if (line2) {
                        this.ctx.font = `bold ${fontSize - 8}px ${FONTS.display}`;
                        this.ctx.fillText(line2.substring(0, 25), x, y + 50 + fontSize);
                    }
                } else {
                    this.ctx.fillText(value, x, y + 60);
                }
                
                // Label - at bottom of card
                this.ctx.fillStyle = COLORS.pink;
                this.ctx.font = `14px ${FONTS.mono}`;
                const label = (stat.label || '').toUpperCase();
                // Truncate label if too long
                const displayLabel = label.length > 30 ? label.substring(0, 30) + '...' : label;
                this.ctx.fillText(displayLabel, x, y + cardHeight - 30);
            }
        });
        
        this.ctx.restore();
    }

    renderVerdict(progress) {
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        
        // Zoom in effect
        const scale = 0.8 + progress * 0.2;
        const opacity = Math.min(progress * 2, 1);
        
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);
        
        // Title - more personal
        this.ctx.fillStyle = COLORS.white;
        this.ctx.font = `bold 100px ${FONTS.display}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('YOUR MOMENT', 0, -80);
        
        // Verdict text
        this.ctx.fillStyle = COLORS.dimWhite;
        this.ctx.font = 'bold 36px "Inter", sans-serif';
        const verdict = this.data.finalVerdict || 'You are amazing!';
        this.wrapText(verdict, 0, 20, 900, 48);
        
        this.ctx.restore();
    }
    
    drawProgressDots(current, total) {
        const dotSize = 8;
        const gap = 20;
        const startX = (CANVAS_WIDTH - (total * dotSize + (total - 1) * gap)) / 2;
        const y = CANVAS_HEIGHT - 100;
        
        for (let i = 0; i < total; i++) {
            const x = startX + i * (dotSize + gap);
            this.ctx.fillStyle = i === current ? COLORS.pink : 'rgba(255,255,255,0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x + dotSize / 2, y, dotSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawWatermark() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = COLORS.white;
        this.ctx.font = 'bold 20px "Space Mono", monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('prompt2wrapped', CANVAS_WIDTH - 40, CANVAS_HEIGHT - 30);
        this.ctx.restore();
    }
    
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = this.ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                this.ctx.fillText(line.trim(), x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line.trim(), x, currentY);
    }
    
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    getCanvas() {
        return this.canvas;
    }
}

// ============================================
// SOUND GENERATOR
// ============================================
class SoundGenerator {
    constructor() {
        this.ctx = null;
        this.destination = null;
        this.oscillators = [];
        this.gainNode = null;
    }
    
    init() {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.destination = this.ctx.createMediaStreamDestination();
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.destination);
    }
    
    start() {
        if (!this.ctx) this.init();
        
        // Ethereal chord (Cmaj9)
        const freqs = [261.63, 329.63, 392.00, 493.88]; // C4, E4, G4, B4
        
        this.oscillators = freqs.map(freq => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            // Slight detune for richness
            osc.detune.setValueAtTime(Math.random() * 10 - 5, this.ctx.currentTime);
            
            const oscGain = this.ctx.createGain();
            oscGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            
            osc.connect(oscGain);
            oscGain.connect(this.gainNode);
            osc.start();
            return { osc, gain: oscGain };
        });
        
        // Fade in
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 1);
    }
    
    stop() {
        if (!this.ctx) return;
        
        // Fade out
        const fadeOutTime = 1;
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeOutTime);
        
        setTimeout(() => {
            this.oscillators.forEach(o => {
                o.osc.stop();
                o.osc.disconnect();
            });
            this.oscillators = [];
            this.ctx.close();
            this.ctx = null;
        }, fadeOutTime * 1000);
    }
    
    getStream() {
        return this.destination ? this.destination.stream : null;
    }
}

// ============================================
// MEDIA RECORDER MANAGER
// ============================================
export class MediaRecorderManager {
    constructor(canvas, audioStream = null) {
        this.canvas = canvas;
        const videoStream = canvas.captureStream(FPS);
        
        // Mix streams if audio provided
        if (audioStream) {
            this.stream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...audioStream.getAudioTracks()
            ]);
        } else {
            this.stream = videoStream;
        }
        
        this.recorder = null;
        this.chunks = [];
    }
    
    static isSupported() {
        return typeof MediaRecorder !== 'undefined' && 
               MediaRecorder.isTypeSupported('video/webm;codecs=vp9');
    }
    
    static getBestMimeType() {
        const types = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return 'video/webm';
    }
    
    record() {
        return new Promise((resolve, reject) => {
            this.chunks = [];
            
            try {
                this.recorder = new MediaRecorder(this.stream, {
                    mimeType: MediaRecorderManager.getBestMimeType(),
                    videoBitsPerSecond: 5000000 // 5 Mbps
                });
                
                this.recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        this.chunks.push(e.data);
                    }
                };
                
                this.recorder.onstop = () => {
                    const blob = new Blob(this.chunks, { type: 'video/webm' });
                    resolve(blob);
                };
                
                this.recorder.onerror = (e) => {
                    reject(new Error('Recording failed: ' + e.error));
                };
                
                this.recorder.start(100);
            } catch (err) {
                reject(err);
            }
        });
    }
    
    stop() {
        if (this.recorder && this.recorder.state !== 'inactive') {
            this.recorder.stop();
        }
    }
}

// ============================================
// GIF CONVERTER (Lazy loaded)
// ============================================
export class GifConverter {
    constructor() {
        this.gifWorker = null;
    }
    
    /**
     * Convert canvas frames to GIF
     * @param {HTMLCanvasElement[]} frames - Array of canvas elements
     * @param {number} delay - Delay between frames in ms
     * @returns {Promise<Blob>} GIF blob
     */
    async convert(frames, delay = 100) {
        // Lazy load gif.js
        if (!window.GIF) {
            await this.loadGifJs();
        }
        
        return new Promise((resolve, reject) => {
            const gif = new window.GIF({
                workers: 2,
                quality: 10,
                width: 480,
                height: 270,
                workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
            });
            
            frames.forEach(frame => {
                // Scale down for GIF
                const scaledCanvas = document.createElement('canvas');
                scaledCanvas.width = 480;
                scaledCanvas.height = 270;
                const ctx = scaledCanvas.getContext('2d');
                ctx.drawImage(frame, 0, 0, 480, 270);
                gif.addFrame(scaledCanvas, { delay });
            });
            
            gif.on('finished', (blob) => {
                resolve(blob);
            });
            
            gif.on('error', (err) => {
                reject(err);
            });
            
            gif.render();
        });
    }
    
    /**
     * Load gif.js library dynamically
     */
    async loadGifJs() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// ============================================
// SHARE MODAL CONTROLLER
// ============================================
export class ShareModalController {
    constructor(data) {
        this.data = data;
        this.highlightReel = null;
        this.recorder = null;
        this.previewCanvas = null;
        this.isRecording = false;
        this.frames = []; // For GIF conversion
    }
    
    /**
     * Open the share modal
     */
    open() {
        this.createModal();
        this.setupEventListeners();
        this.startPreview();
    }
    
    /**
     * Create modal DOM
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'share-modal';
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-modal-content">
                <button class="share-close-btn" id="share-close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                
                <h2 class="share-title">SHARE YOUR WRAPPED</h2>
                
                <div class="share-preview-container">
                    <canvas id="share-preview-canvas" width="640" height="360"></canvas>
                    <div class="share-preview-overlay" id="preview-overlay">
                        <span>Click to preview</span>
                    </div>
                </div>
                
                <div class="share-progress-container hidden" id="progress-container">
                    <div class="share-progress-bar">
                        <div class="share-progress-fill" id="progress-fill"></div>
                    </div>
                    <span class="share-progress-text" id="progress-text">Recording...</span>
                </div>
                
                <div class="share-format-toggle">
                    <button class="format-btn active" data-format="webm">
                        <svg class="format-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                        <span class="format-label">WebM (HD)</span>
                    </button>
                    <button class="format-btn" data-format="gif">
                        <svg class="format-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h2v6H9z"/><path d="M15 13h-2v2h2z"/><path d="M15 9h-2v2h2"/></svg>
                        <span class="format-label">GIF (Social)</span>
                    </button>
                </div>
                
                <div class="share-actions">
                    <button class="share-btn primary" id="download-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Download
                    </button>
                    <button class="share-btn secondary" id="native-share-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        Share
                    </button>
                </div>
                
                <p class="share-note">
                    ${MediaRecorderManager.isSupported() 
                        ? '12-second highlight reel • 1080p quality' 
                        : '⚠️ WebM recording not supported in this browser. Try Chrome or Firefox.'}
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Trigger enter animation
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        document.getElementById('share-close').addEventListener('click', () => this.close());
        
        // Click outside to close
        document.getElementById('share-modal').addEventListener('click', (e) => {
            if (e.target.id === 'share-modal') this.close();
        });
        
        // Preview click
        document.getElementById('preview-overlay').addEventListener('click', () => {
            this.startPreview();
        });
        
        // Format toggle
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Download button
        document.getElementById('download-btn').addEventListener('click', () => {
            this.startRecording();
        });
        
        // Native share button
        const nativeShareBtn = document.getElementById('native-share-btn');
        if (navigator.share) {
            nativeShareBtn.addEventListener('click', () => {
                this.shareNative();
            });
        } else {
            nativeShareBtn.style.display = 'none';
        }
        
        // Escape key
        document.addEventListener('keydown', this.handleEscape.bind(this));
    }
    
    /**
     * Handle escape key
     */
    handleEscape(e) {
        if (e.key === 'Escape') {
            this.close();
        }
    }
    
    /**
     * Start preview animation
     */
    startPreview() {
        const previewCanvas = document.getElementById('share-preview-canvas');
        const overlay = document.getElementById('preview-overlay');
        
        if (this.highlightReel) {
            this.highlightReel.stop();
        }
        
        this.highlightReel = new HighlightReel(this.data);
        overlay.classList.add('hidden');
        
        const ctx = previewCanvas.getContext('2d');
        
        this.highlightReel.play(
            (sourceCanvas, progress) => {
                // Scale down to preview size
                ctx.drawImage(sourceCanvas, 0, 0, 640, 360);
            },
            () => {
                overlay.classList.remove('hidden');
                overlay.querySelector('span').textContent = 'Click to replay';
            }
        );
    }
    
    /**
     * Start recording
     */
    async startRecording() {
        if (this.isRecording) return;
        
        const format = document.querySelector('.format-btn.active').dataset.format;
        const progressContainer = document.getElementById('progress-container');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const downloadBtn = document.getElementById('download-btn');
        
        this.isRecording = true;
        downloadBtn.disabled = true;
        progressContainer.classList.remove('hidden');
        
        // Create new highlight reel for recording
        this.highlightReel = new HighlightReel(this.data);
        this.recorder = new MediaRecorderManager(this.highlightReel.getCanvas());
        this.frames = [];
        
        // Start recording
        const recordingPromise = this.recorder.record();
        
        // Play the highlight reel
        await this.highlightReel.play(
            (canvas, progress) => {
                progressFill.style.width = `${progress * 100}%`;
                progressText.textContent = `Recording... ${Math.round(progress * 100)}%`;
                
                // Capture frames for GIF
                if (format === 'gif' && progress % 0.05 < 0.02) {
                    const frameCanvas = document.createElement('canvas');
                    frameCanvas.width = canvas.width;
                    frameCanvas.height = canvas.height;
                    frameCanvas.getContext('2d').drawImage(canvas, 0, 0);
                    this.frames.push(frameCanvas);
                }
                
                // Update preview
                const previewCanvas = document.getElementById('share-preview-canvas');
                previewCanvas.getContext('2d').drawImage(canvas, 0, 0, 640, 360);
            },
            () => {
                this.recorder.stop();
            }
        );
        
        // Wait for recording to finish
        const webmBlob = await recordingPromise;
        
        progressText.textContent = 'Processing...';
        
        let finalBlob = webmBlob;
        let filename = `prompt2wrapped_${Date.now()}.webm`;
        
        // Convert to GIF if selected
        if (format === 'gif' && this.frames.length > 0) {
            progressText.textContent = 'Converting to GIF...';
            try {
                const converter = new GifConverter();
                finalBlob = await converter.convert(this.frames, 100);
                filename = `prompt2wrapped_${Date.now()}.gif`;
            } catch (err) {
                console.error('GIF conversion failed:', err);
                progressText.textContent = 'GIF conversion failed, downloading WebM instead';
                await new Promise(r => setTimeout(r, 1500));
            }
        }
        
        // Download
        this.downloadBlob(finalBlob, filename);
        
        // Reset state
        this.isRecording = false;
        downloadBtn.disabled = false;
        progressContainer.classList.add('hidden');
        progressFill.style.width = '0%';
        
        // Show replay option
        document.getElementById('preview-overlay').classList.remove('hidden');
        document.getElementById('preview-overlay').querySelector('span').textContent = 'Click to replay';
    }
    
    /**
     * Download blob as file
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Share using Web Share API
     */
    async shareNative() {
        if (!navigator.share) return;
        
        // First, record if we haven't already
        if (this.isRecording) return;
        
        await this.startRecording();
        
        // Note: Web Share API with files is limited
        // For now, just share the link
        try {
            await navigator.share({
                title: `${this.data.userName}'s Prompt2Wrapped`,
                text: this.data.tagline || 'Check out my year in prompts!',
                url: window.location.href
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
        }
    }
    
    /**
     * Close the modal
     */
    close() {
        if (this.highlightReel) {
            this.highlightReel.stop();
        }
        
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        
        document.removeEventListener('keydown', this.handleEscape);
    }
}

// ============================================
// CONVENIENCE FUNCTION
// ============================================
export function openShareModal(data) {
    const controller = new ShareModalController(data);
    controller.open();
    return controller;
}
