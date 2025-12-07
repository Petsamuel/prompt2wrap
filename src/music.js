/**
 * Music Controller Module
 * Handles background ambient music with fade in/out
 */

// Background ambient music URL - royalty free lo-fi ambient
const AMBIENT_MUSIC_URL = 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3';

class MusicController {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.volume = 0.3;
        this.fadeInterval = null;
        this.isInitialized = false;
    }

    /**
     * Initialize audio element (must be called after user interaction)
     */
    init() {
        if (this.isInitialized) return;
        
        this.audio = new Audio(AMBIENT_MUSIC_URL);
        this.audio.loop = true;
        this.audio.volume = 0;
        this.audio.preload = 'auto';
        this.isInitialized = true;
        
        // Save preference
        const saved = localStorage.getItem('p2w_music');
        if (saved === 'on') {
            this.play();
        }
    }

    /**
     * Play music with fade in
     */
    async play() {
        if (!this.isInitialized) this.init();
        if (this.isPlaying) return;

        try {
            this.isPlaying = true;
            this.audio.volume = 0;
            await this.audio.play();
            this.fadeIn();
            localStorage.setItem('p2w_music', 'on');
        } catch (err) {
            console.warn('Music autoplay blocked:', err);
            this.isPlaying = false;
        }
    }

    /**
     * Pause music with fade out
     */
    pause() {
        if (!this.isPlaying) return;
        
        this.fadeOut(() => {
            this.audio.pause();
            this.isPlaying = false;
        });
        localStorage.setItem('p2w_music', 'off');
    }

    /**
     * Toggle music on/off
     * @returns {boolean} The NEW state (playing = true, paused = false)
     */
    toggle() {
        if (this.isPlaying) {
            this.pause();
            return false; // Will be paused
        } else {
            this.play();
            return true; // Will be playing
        }
    }

    /**
     * Fade in audio
     */
    fadeIn() {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        
        this.fadeInterval = setInterval(() => {
            if (this.audio.volume < this.volume) {
                this.audio.volume = Math.min(this.audio.volume + 0.02, this.volume);
            } else {
                clearInterval(this.fadeInterval);
            }
        }, 50);
    }

    /**
     * Fade out audio
     */
    fadeOut(callback) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        
        this.fadeInterval = setInterval(() => {
            if (this.audio.volume > 0.02) {
                this.audio.volume = Math.max(this.audio.volume - 0.02, 0);
            } else {
                this.audio.volume = 0;
                clearInterval(this.fadeInterval);
                if (callback) callback();
            }
        }, 50);
    }

    /**
     * Get current state
     */
    getState() {
        return this.isPlaying;
    }
}

// Singleton instance
export const musicController = new MusicController();

/**
 * Create and return the music toggle button HTML
 */
export function createMusicToggle() {
    return `
        <button id="music-toggle" class="music-toggle" aria-label="Toggle Music" title="Toggle ambient music">
            <svg class="music-icon music-on" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
            </svg>
            <svg class="music-icon music-off" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
                <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" stroke-width="2"/>
            </svg>
        </button>
    `;
}

/**
 * Initialize music toggle button event listeners
 */
export function initMusicToggle() {
    const btn = document.getElementById('music-toggle');
    if (!btn) return;
    
    // Set initial state
    const saved = localStorage.getItem('p2w_music');
    if (saved === 'on') {
        btn.classList.add('active');
    }
    
    btn.addEventListener('click', () => {
        musicController.init();
        const isPlaying = musicController.toggle();
        btn.classList.toggle('active', isPlaying);
    });
}
