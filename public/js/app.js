/**
 * Frontend JavaScript application for the Akai MPD2 Soundboard
 */

/**
 * Audio Manager class for handling Web Audio API
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.audioBuffers = new Map();
        this.masterGainNode = null;
        this.masterVolume = 0.8;
        this.muted = false;
        this.initialize();
    }

    /**
     * Initializes the audio context
     */
    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.connect(this.audioContext.destination);
            this.masterGainNode.gain.value = this.masterVolume;
            
            // Handle audio context state changes
            this.audioContext.addEventListener('statechange', () => {
                this.updateAudioContextStatus();
            });
            
            this.updateAudioContextStatus();
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            throw new Error('Audio initialization failed');
        }
    }

    /**
     * Activates the audio context (required for user interaction)
     */
    async activateAudioContext() {
        if (!this.audioContext) {
            await this.initialize();
        }
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        this.updateAudioContextStatus();
    }

    /**
     * Loads an audio file and stores its buffer
     */
    async loadAudioFile(audioFile) {
        if (!this.audioContext) {
            throw new Error('Audio context not initialized');
        }

        try {
            const response = await fetch(audioFile.url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioBuffers.set(audioFile.id, audioBuffer);
        } catch (error) {
            console.error(`Failed to load audio file ${audioFile.filename}:`, error);
            throw error;
        }
    }

    /**
     * Plays an audio file
     */
    async playAudio(audioFileId, volume = 1.0) {
        if (!this.audioContext || !this.masterGainNode) {
            throw new Error('Audio context not initialized');
        }

        if (this.muted) {
            return;
        }

        const audioBuffer = this.audioBuffers.get(audioFileId);
        if (!audioBuffer) {
            throw new Error(`Audio buffer not found for ID: ${audioFileId}`);
        }

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = audioBuffer;
            gainNode.gain.value = volume;
            
            source.connect(gainNode);
            gainNode.connect(this.masterGainNode);
            
            source.start(0);
        } catch (error) {
            console.error('Failed to play audio:', error);
            throw error;
        }
    }

    /**
     * Sets the master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.muted ? 0 : this.masterVolume;
        }
    }

    /**
     * Gets the current master volume
     */
    getMasterVolume() {
        return this.masterVolume;
    }

    /**
     * Toggles mute state
     */
    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.muted ? 0 : this.masterVolume;
        }
        return this.muted;
    }

    /**
     * Gets the mute state
     */
    isMuted() {
        return this.muted;
    }

    /**
     * Gets the audio context state
     */
    getAudioContextState() {
        return this.audioContext?.state || 'closed';
    }

    /**
     * Updates the audio context status in the UI
     */
    updateAudioContextStatus() {
        const statusElement = document.getElementById('context-status');
        const audioStatusElement = document.getElementById('audio-status');
        
        if (statusElement) {
            statusElement.textContent = this.getAudioContextState();
        }
        
        if (audioStatusElement) {
            const isReady = this.audioContext?.state === 'running';
            audioStatusElement.textContent = isReady ? 'Ready' : 'Suspended';
        }
    }

    /**
     * Preloads all audio files
     */
    async preloadAudioFiles(audioFiles) {
        const loadPromises = audioFiles.map(file => 
            this.loadAudioFile(file).catch(error => {
                console.warn(`Failed to preload ${file.filename}:`, error);
                return null;
            })
        );
        
        await Promise.all(loadPromises);
    }
}

/**
 * Soundboard Controller class for managing the pad interface
 */
class SoundboardController {
    constructor() {
        this.audioManager = new AudioManager();
        this.audioFiles = [];
        this.state = {
            pads: this.initializePads(),
            masterVolume: 0.8,
            muted: false,
            audioContextState: 'suspended'
        };
        this.keyboardMap = new Map();
        this.setupKeyboardMapping();
        this.bindEvents();
    }

    /**
     * Initializes the soundboard
     */
    async initialize() {
        try {
            await this.loadAudioFiles();
            await this.setupUI();
            this.hideLoadingScreen();
            
            // Show audio activation notice if needed
            if (this.audioManager.getAudioContextState() === 'suspended') {
                this.showAudioNotice();
            }
        } catch (error) {
            console.error('Failed to initialize soundboard:', error);
            this.showError('Failed to initialize soundboard: ' + error.message);
        }
    }

    /**
     * Loads audio files from the API
     */
    async loadAudioFiles() {
        try {
            const response = await fetch('/api/audio-files');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to load audio files');
            }
            
            this.audioFiles = data.data;
            this.updateFileCount(data.count);
            
            // Preload audio files
            await this.audioManager.preloadAudioFiles(this.audioFiles);
            
        } catch (error) {
            console.error('Failed to load audio files:', error);
            throw error;
        }
    }

    /**
     * Sets up the user interface
     */
    async setupUI() {
        this.renderPadGrid();
        this.setupVolumeControl();
        this.updateUI();
    }

    /**
     * Renders the pad grid
     */
    renderPadGrid() {
        const padGrid = document.getElementById('pad-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!padGrid || !emptyState) return;

        if (this.audioFiles.length === 0) {
            padGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        padGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        padGrid.innerHTML = '';

        // Create 16 pads (4x4 grid)
        for (let i = 0; i < 16; i++) {
            const pad = this.createPadElement(i);
            padGrid.appendChild(pad);
        }
    }

    /**
     * Creates a pad element
     */
    createPadElement(index) {
        const pad = document.createElement('div');
        pad.className = 'pad';
        pad.dataset.index = index.toString();
        pad.tabIndex = 0;

        const audioFile = this.audioFiles[index];
        const keyBinding = this.getKeyForPad(index);

        pad.innerHTML = `
            <div class="pad-number">${(index + 1).toString().padStart(2, '0')}</div>
            <div class="pad-name">${audioFile ? audioFile.displayName : 'Empty'}</div>
            <div class="pad-info">${audioFile ? this.formatFileSize(audioFile.size) : ''}</div>
            <div class="pad-key">${keyBinding}</div>
        `;

        if (!audioFile) {
            pad.classList.add('disabled');
        }

        // Add event listeners
        pad.addEventListener('click', () => this.handlePadClick(index));
        pad.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                this.handlePadClick(index);
            }
        });

        return pad;
    }

    /**
     * Handles pad click/activation
     */
    async handlePadClick(index) {
        const audioFile = this.audioFiles[index];
        if (!audioFile) return;

        const pad = document.querySelector(`[data-index="${index}"]`);
        if (!pad) return;

        try {
            // Activate audio context if needed
            if (this.audioManager.getAudioContextState() === 'suspended') {
                await this.audioManager.activateAudioContext();
                this.hideAudioNotice();
            }

            // Visual feedback
            pad.classList.add('playing');
            setTimeout(() => pad.classList.remove('playing'), 500);

            // Play audio
            const padConfig = this.state.pads[index];
            await this.audioManager.playAudio(audioFile.id, padConfig.volume);

        } catch (error) {
            console.error('Failed to play audio:', error);
            this.showError('Failed to play audio: ' + error.message);
        }
    }

    /**
     * Initializes pad configurations
     */
    initializePads() {
        return Array.from({ length: 16 }, (_, index) => ({
            index,
            volume: 1.0,
            muted: false
        }));
    }

    /**
     * Sets up keyboard mapping
     */
    setupKeyboardMapping() {
        const keys = ['1', '2', '3', '4', 'q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];
        keys.forEach((key, index) => {
            this.keyboardMap.set(key.toLowerCase(), index);
        });
    }

    /**
     * Gets the keyboard key for a pad
     */
    getKeyForPad(index) {
        const keys = ['1', '2', '3', '4', 'Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V'];
        return keys[index] || '';
    }

    /**
     * Sets up volume control
     */
    setupVolumeControl() {
        const volumeSlider = document.getElementById('master-volume');
        const volumeDisplay = document.getElementById('volume-display');
        
        if (volumeSlider && volumeDisplay) {
            volumeSlider.value = this.state.masterVolume.toString();
            volumeDisplay.textContent = Math.round(this.state.masterVolume * 100) + '%';
            
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseFloat(e.target.value);
                this.setMasterVolume(volume);
            });
        }
    }

    /**
     * Sets the master volume
     */
    setMasterVolume(volume) {
        this.state.masterVolume = volume;
        this.audioManager.setMasterVolume(volume);
        
        const volumeDisplay = document.getElementById('volume-display');
        if (volumeDisplay) {
            volumeDisplay.textContent = Math.round(volume * 100) + '%';
        }
    }

    /**
     * Binds event listeners
     */
    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const padIndex = this.keyboardMap.get(key);
            
            if (padIndex !== undefined && !e.repeat) {
                e.preventDefault();
                this.handlePadClick(padIndex);
            }
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        const refreshEmpty = document.getElementById('refresh-empty');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAudioFiles());
        }
        
        if (refreshEmpty) {
            refreshEmpty.addEventListener('click', () => this.refreshAudioFiles());
        }

        // Mute button
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleMute());
        }

        // Audio activation
        const activateAudioBtn = document.getElementById('activate-audio');
        if (activateAudioBtn) {
            activateAudioBtn.addEventListener('click', () => this.activateAudio());
        }

        // Error modal
        const closeErrorBtn = document.getElementById('close-error');
        const errorOkBtn = document.getElementById('error-ok');
        
        if (closeErrorBtn) {
            closeErrorBtn.addEventListener('click', () => this.hideError());
        }
        
        if (errorOkBtn) {
            errorOkBtn.addEventListener('click', () => this.hideError());
        }

        // Click anywhere to activate audio
        document.addEventListener('click', async () => {
            if (this.audioManager.getAudioContextState() === 'suspended') {
                await this.activateAudio();
            }
        }, { once: true });
    }

    /**
     * Refreshes audio files
     */
    async refreshAudioFiles() {
        try {
            await this.loadAudioFiles();
            this.renderPadGrid();
            this.updateUI();
        } catch (error) {
            console.error('Failed to refresh audio files:', error);
            this.showError('Failed to refresh audio files: ' + error.message);
        }
    }

    /**
     * Toggles mute
     */
    toggleMute() {
        const isMuted = this.audioManager.toggleMute();
        this.state.muted = isMuted;
        
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.classList.toggle('muted', isMuted);
            const icon = muteBtn.querySelector('.btn-icon');
            if (icon) {
                icon.textContent = isMuted ? '🔇' : '🔊';
            }
        }
    }

    /**
     * Activates audio context
     */
    async activateAudio() {
        try {
            await this.audioManager.activateAudioContext();
            this.hideAudioNotice();
        } catch (error) {
            console.error('Failed to activate audio:', error);
            this.showError('Failed to activate audio: ' + error.message);
        }
    }

    /**
     * Updates the UI
     */
    updateUI() {
        this.updateFileCount(this.audioFiles.length);
    }

    /**
     * Updates file count display
     */
    updateFileCount(count) {
        const fileCountElement = document.getElementById('file-count');
        if (fileCountElement) {
            fileCountElement.textContent = count.toString();
        }
    }

    /**
     * Formats file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * Shows the loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (app) app.style.display = 'none';
    }

    /**
     * Hides the loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (app) app.style.display = 'flex';
    }

    /**
     * Shows the audio notice
     */
    showAudioNotice() {
        const audioNotice = document.getElementById('audio-notice');
        if (audioNotice) {
            audioNotice.style.display = 'block';
        }
    }

    /**
     * Hides the audio notice
     */
    hideAudioNotice() {
        const audioNotice = document.getElementById('audio-notice');
        if (audioNotice) {
            audioNotice.style.display = 'none';
        }
    }

    /**
     * Shows an error message
     */
    showError(message) {
        const errorModal = document.getElementById('error-modal');
        const errorMessage = document.getElementById('error-message');
        
        if (errorModal && errorMessage) {
            errorMessage.textContent = message;
            errorModal.style.display = 'flex';
        }
    }

    /**
     * Hides the error message
     */
    hideError() {
        const errorModal = document.getElementById('error-modal');
        if (errorModal) {
            errorModal.style.display = 'none';
        }
    }
}

/**
 * Application initialization
 */
class App {
    constructor() {
        this.soundboardController = new SoundboardController();
    }

    /**
     * Starts the application
     */
    async start() {
        try {
            await this.soundboardController.initialize();
            console.log('🎵 Soundboard application started successfully');
        } catch (error) {
            console.error('❌ Failed to start soundboard application:', error);
        }
    }
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.start().catch(error => {
        console.error('Failed to start application:', error);
    });
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, SoundboardController, AudioManager };
}
