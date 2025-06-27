/**
 * Frontend TypeScript application for the Akai MPD2 Soundboard
 */

// Type definitions
type AppAudioState = 'suspended' | 'running' | 'closed';

interface AudioFile {
    id: string;
    filename: string;
    displayName: string;
    path: string;
    url: string;
    size: number;
    mimeType: string;
    duration?: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface PadConfig {
    index: number;
    volume: number;
    muted: boolean;
}

interface SoundboardState {
    pads: PadConfig[];
    masterVolume: number;
    muted: boolean;
    audioContextState: AppAudioState;
}

/**
 * Audio Manager class for handling audio playback using HTML5 Audio
 */
class AudioManager {
    private audioElements: Map<string, HTMLAudioElement> = new Map();
    private masterVolume: number = 0.8;
    private muted: boolean = false;
    private audioContextState: AppAudioState = 'suspended';
    private userInteracted: boolean = false;
    private isMobile: boolean = false;

    constructor() {
        // Detect mobile browsers (including Chrome mobile)
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       !!(navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
        
        // Listen for first user interaction
        this.setupUserInteractionDetection();
    }

    /**
     * Sets up detection for user interaction (required for Chrome mobile)
     */
    private setupUserInteractionDetection(): void {
        const markUserInteraction = () => {
            this.userInteracted = true;
            // Remove listeners after first interaction
            document.removeEventListener('touchstart', markUserInteraction);
            document.removeEventListener('click', markUserInteraction);
            document.removeEventListener('keydown', markUserInteraction);
        };

        document.addEventListener('touchstart', markUserInteraction, { once: true, passive: true });
        document.addEventListener('click', markUserInteraction, { once: true });
        document.addEventListener('keydown', markUserInteraction, { once: true });
    }

    /**
     * Initializes the audio system using HTML5 Audio elements
     */
    async initialize(): Promise<void> {
        try {
            // Test if we can create audio elements
            const testAudio = new Audio();
            testAudio.volume = 0;
            
            this.audioContextState = 'running';
            console.log('🎵 Using HTML5 Audio elements for better iOS compatibility');
            
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
            throw new Error('Audio initialization failed');
        }
    }

    /**
     * Activates the audio context (enhanced for Chrome mobile compatibility)
     */
    async activateAudioContext(): Promise<void> {
        this.audioContextState = 'running';
        this.userInteracted = true;
        
        // For Chrome mobile, we need to trigger a test audio play to "unlock" audio
        if (this.isMobile) {
            await this.unlockAudioForMobile();
        }
        
        this.updateAudioContextStatus();
    }

    /**
     * Unlocks audio for mobile browsers (especially Chrome mobile)
     */
    private async unlockAudioForMobile(): Promise<void> {
        try {
            // Create a silent audio element and play it to unlock audio
            const unlockAudio = new Audio();
            unlockAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAABAAEAf/8AAA==';
            unlockAudio.volume = 0.1;
            unlockAudio.muted = false;
            
            // Try to play the unlock audio
            const playPromise = unlockAudio.play();
            if (playPromise !== undefined) {
                await playPromise.catch(() => {
                    // Ignore play errors for unlock audio
                    console.warn('Audio unlock failed, but continuing...');
                });
            }
            
            // Clean up
            unlockAudio.pause();
            unlockAudio.src = '';
            
            console.log('🔓 Audio unlocked for mobile browser');
            
        } catch (error) {
            console.warn('Failed to unlock audio for mobile:', error);
        }
    }

    /**
     * Loads an audio file and creates an HTML5 Audio element (enhanced for Chrome mobile)
     */
    async loadAudioFile(audioFile: AudioFile): Promise<void> {
        try {
            const audio = new Audio();
            
            // Configure for mobile compatibility
            if (this.isMobile) {
                audio.preload = 'metadata'; // Use metadata instead of auto for mobile
                audio.crossOrigin = 'anonymous';
            } else {
                audio.preload = 'auto';
            }
            
            audio.volume = this.muted ? 0 : this.masterVolume;
            audio.src = audioFile.url;
            
            // Wait for the audio to be ready
            await new Promise<void>((resolve, reject) => {
                const handleReady = () => {
                    audio.removeEventListener('canplaythrough', handleReady);
                    audio.removeEventListener('loadedmetadata', handleReady);
                    audio.removeEventListener('error', handleError);
                    resolve();
                };
                
                const handleError = () => {
                    audio.removeEventListener('canplaythrough', handleReady);
                    audio.removeEventListener('loadedmetadata', handleReady);
                    audio.removeEventListener('error', handleError);
                    reject(new Error(`Failed to load ${audioFile.filename}`));
                };
                
                // For mobile, we only need metadata loaded
                if (this.isMobile) {
                    audio.addEventListener('loadedmetadata', handleReady, { once: true });
                } else {
                    audio.addEventListener('canplaythrough', handleReady, { once: true });
                }
                
                audio.addEventListener('error', handleError, { once: true });
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    audio.removeEventListener('canplaythrough', handleReady);
                    audio.removeEventListener('loadedmetadata', handleReady);
                    audio.removeEventListener('error', handleError);
                    reject(new Error(`Timeout loading ${audioFile.filename}`));
                }, 10000);
            });
            
            this.audioElements.set(audioFile.id, audio);
            
        } catch (error) {
            console.error(`Failed to load audio file ${audioFile.filename}:`, error);
            throw error;
        }
    }

    /**
     * Plays an audio file using HTML5 Audio (enhanced for Chrome mobile)
     */
    async playAudio(audioFileId: string, volume: number = 1.0): Promise<void> {
        if (this.muted) {
            return;
        }

        // Ensure user has interacted for Chrome mobile
        if (this.isMobile && !this.userInteracted) {
            throw new Error('User interaction required for mobile audio playback');
        }

        const audio = this.audioElements.get(audioFileId);
        if (!audio) {
            throw new Error(`Audio element not found for ID: ${audioFileId}`);
        }

        try {
            // For Chrome mobile, ensure the audio is properly loaded
            if (this.isMobile && audio.readyState < 2) {
                // Force load the audio
                audio.load();
                await new Promise<void>((resolve, reject) => {
                    const handleCanPlay = () => {
                        audio.removeEventListener('canplay', handleCanPlay);
                        audio.removeEventListener('error', handleError);
                        resolve();
                    };
                    const handleError = () => {
                        audio.removeEventListener('canplay', handleCanPlay);
                        audio.removeEventListener('error', handleError);
                        reject(new Error('Failed to load audio for playback'));
                    };
                    
                    audio.addEventListener('canplay', handleCanPlay, { once: true });
                    audio.addEventListener('error', handleError, { once: true });
                    
                    // Timeout after 3 seconds
                    setTimeout(() => {
                        audio.removeEventListener('canplay', handleCanPlay);
                        audio.removeEventListener('error', handleError);
                        reject(new Error('Audio load timeout'));
                    }, 3000);
                });
            }

            // Reset to beginning and set volume
            audio.currentTime = 0;
            audio.volume = Math.min(this.masterVolume * volume, 1.0);
            
            // Ensure audio is not muted
            audio.muted = false;
            
            // Play the audio with enhanced error handling for mobile
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                await playPromise.catch((playError) => {
                    console.error('Play failed:', playError);
                    // For Chrome mobile, try one more time after a brief delay
                    if (this.isMobile && playError.name === 'NotAllowedError') {
                        throw new Error('Audio play not allowed - ensure user interaction occurred');
                    }
                    throw playError;
                });
            }

            // Trigger haptic feedback on supported devices
            if ('vibrate' in navigator && this.isMobile) {
                navigator.vibrate(50);
            }

        } catch (error) {
            console.error('Failed to play audio:', error);
            throw error;
        }
    }

    /**
     * Sets the master volume
     */
    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        // Update all audio elements
        this.audioElements.forEach(audio => {
            audio.volume = this.muted ? 0 : this.masterVolume;
        });
    }

    /**
     * Gets the current master volume
     */
    getMasterVolume(): number {
        return this.masterVolume;
    }

    /**
     * Toggles mute state
     */
    toggleMute(): boolean {
        this.muted = !this.muted;
        
        // Update all audio elements
        this.audioElements.forEach(audio => {
            audio.volume = this.muted ? 0 : this.masterVolume;
        });
        
        return this.muted;
    }

    /**
     * Gets the mute state
     */
    isMuted(): boolean {
        return this.muted;
    }

    /**
     * Gets the audio context state
     */
    getAudioContextState(): AppAudioState {
        return this.audioContextState;
    }

    /**
     * Checks if an audio file is already loaded
     */
    isAudioLoaded(audioFileId: string): boolean {
        return this.audioElements.has(audioFileId);
    }

    /**
     * Updates the audio context status in the UI
     */
    private updateAudioContextStatus(): void {
        const statusElement = document.getElementById('context-status');
        const audioStatusElement = document.getElementById('audio-status');
        
        if (statusElement) {
            statusElement.textContent = this.getAudioContextState();
        }
        
        if (audioStatusElement) {
            const isReady = this.audioContextState === 'running';
            audioStatusElement.textContent = isReady ? 'Ready' : 'Suspended';
        }
    }

    /**
     * Preloads all audio files
     */
    async preloadAudioFiles(audioFiles: AudioFile[]): Promise<void> {
        console.log(`Preloading ${audioFiles.length} audio files...`);
        
        const loadPromises = audioFiles.map(file => 
            this.loadAudioFile(file).catch(error => {
                console.warn(`Failed to preload ${file.filename}:`, error);
                return null;
            })
        );
        
        await Promise.all(loadPromises);
        console.log(`Preloaded ${audioFiles.length} audio files`);
    }

    /**
     * Preloads remaining audio files in the background
     */
    async preloadRemainingFiles(audioFiles: AudioFile[]): Promise<void> {
        const unloadedFiles = audioFiles.filter(file => !this.audioElements.has(file.id));
        if (unloadedFiles.length > 0) {
            console.log(`Background preloading ${unloadedFiles.length} remaining audio files...`);
            await this.preloadAudioFiles(unloadedFiles);
        }
    }
}

/**
 * Soundboard Controller class for managing the pad interface
 */
class SoundboardController {
    private audioManager: AudioManager;
    private audioFiles: AudioFile[] = [];
    private state: SoundboardState;

    constructor() {
        this.audioManager = new AudioManager();
        this.state = {
            pads: [],
            masterVolume: 0.8,
            muted: false,
            audioContextState: 'suspended'
        };
        this.bindEvents();
    }

    /**
     * Initializes the soundboard
     */
    async initialize(): Promise<void> {
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
            const message = error instanceof Error ? error.message : String(error);
            this.showError('Failed to initialize soundboard: ' + message);
        }
    }

    /**
     * Loads audio files from the API
     */
    private async loadAudioFiles(): Promise<void> {
        try {
            const response = await fetch('/api/audio-files');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data: ApiResponse<AudioFile[]> = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to load audio files');
            }
            
            this.audioFiles = data.data;
            this.updateFileCount(this.audioFiles.length);
            
            // Initialize pads based on actual file count
            this.initializePads();
            
            // Initialize audio context but don't preload files yet (requires user interaction)
            await this.audioManager.initialize();
            
        } catch (error) {
            console.error('Failed to load audio files:', error);
            throw error;
        }
    }

    /**
     * Sets up the user interface
     */
    private async setupUI(): Promise<void> {
        this.renderPadGrid();
        this.setupVolumeControl();
        this.updateUI();
    }

    /**
     * Renders the pad grid - now supports any number of audio files
     */
    private renderPadGrid(): void {
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

        // Calculate optimal grid layout based on number of files
        this.updateGridLayout(padGrid, this.audioFiles.length);

        // Create pads for ALL audio files
        for (let i = 0; i < this.audioFiles.length; i++) {
            const pad = this.createPadElement(i);
            padGrid.appendChild(pad);
        }
    }

    /**
     * Updates the CSS grid layout based on number of pads and screen size
     */
    private updateGridLayout(padGrid: HTMLElement, padCount: number): void {
        let columns: number;
        
        // Check screen width for responsive behavior
        const screenWidth = window.innerWidth;
        
        if (screenWidth <= 480) {
            // Mobile: maximum 2 columns
            columns = Math.min(2, padCount);
        } else if (screenWidth <= 768) {
            // Tablet: maximum 3 columns
            if (padCount <= 3) {
                columns = padCount;
            } else if (padCount <= 9) {
                columns = 3;
            } else {
                columns = 4;
            }
        } else {
            // Desktop: flexible layout
            if (padCount <= 4) {
                columns = padCount;
            } else if (padCount <= 16) {
                columns = 4;
            } else if (padCount <= 25) {
                columns = 5;
            } else if (padCount <= 36) {
                columns = 6;
            } else if (padCount <= 49) {
                columns = 7;
            } else {
                columns = 8; // Maximum of 8 columns for readability
            }
        }
        
        padGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    /**
     * Creates a pad element
     */
    private createPadElement(index: number): HTMLElement {
        const pad = document.createElement('div');
        pad.className = 'pad';
        pad.dataset['index'] = index.toString();
        pad.tabIndex = 0;

        const audioFile = this.audioFiles[index];

        pad.innerHTML = `
            <div class="pad-number">${(index + 1).toString().padStart(2, '0')}</div>
            <div class="pad-name">${audioFile ? audioFile.displayName : 'Empty'}</div>
            <div class="pad-info">${audioFile ? this.formatFileSize(audioFile.size) : ''}</div>
        `;

        if (!audioFile) {
            pad.classList.add('disabled');
        }

        // Add event listeners
        pad.addEventListener('click', () => this.handlePadClick(index));
        pad.addEventListener('keydown', (e: KeyboardEvent) => {
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
    private async handlePadClick(index: number): Promise<void> {
        const audioFile = this.audioFiles[index];
        if (!audioFile) return;

        const pad = document.querySelector(`[data-index="${index}"]`) as HTMLElement;
        if (!pad) return;

        try {
            // Activate audio context if needed
            if (this.audioManager.getAudioContextState() === 'suspended') {
                await this.audioManager.activateAudioContext();
                this.hideAudioNotice();
                
                // Start background preloading after first activation
                this.audioManager.preloadRemainingFiles(this.audioFiles).catch(error => {
                    console.warn('Background preloading failed:', error);
                });
            }

            // Load audio file if not already loaded (lazy loading)
            if (!this.audioManager.isAudioLoaded(audioFile.id)) {
                await this.audioManager.loadAudioFile(audioFile);
            }

            // Visual feedback
            pad.classList.add('playing');
            setTimeout(() => pad.classList.remove('playing'), 500);

            // Play audio
            const padConfig = this.state.pads[index];
            const volume = padConfig ? padConfig.volume : 1.0;
            await this.audioManager.playAudio(audioFile.id, volume);

        } catch (error) {
            console.error('Failed to play audio:', error);
            const message = error instanceof Error ? error.message : String(error);
            this.showError('Failed to play audio: ' + message);
        }
    }

    /**
     * Initializes pad configurations based on actual audio files count
     */
    private initializePads(): void {
        this.state.pads = Array.from({ length: this.audioFiles.length }, (_, index) => ({
            index,
            volume: 1.0,
            muted: false
        }));
    }

    /**
     * Sets up volume control
     */
    private setupVolumeControl(): void {
        const volumeSlider = document.getElementById('master-volume') as HTMLInputElement;
        const volumeDisplay = document.getElementById('volume-display');
        
        if (volumeSlider && volumeDisplay) {
            volumeSlider.value = this.state.masterVolume.toString();
            volumeDisplay.textContent = Math.round(this.state.masterVolume * 100) + '%';
            
            volumeSlider.addEventListener('input', (e: Event) => {
                const target = e.target as HTMLInputElement;
                const volume = parseFloat(target.value);
                this.setMasterVolume(volume);
            });
        }
    }

    /**
     * Sets the master volume
     */
    private setMasterVolume(volume: number): void {
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
    private bindEvents(): void {
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

        // Silent mode warning dismissal
        const dismissSilentBtn = document.getElementById('dismiss-silent-warning');
        if (dismissSilentBtn) {
            dismissSilentBtn.addEventListener('click', () => this.hideSilentModeWarning());
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

        // Handle window resize for responsive grid layout
        window.addEventListener('resize', () => {
            const padGrid = document.getElementById('pad-grid');
            if (padGrid && this.audioFiles.length > 0) {
                this.updateGridLayout(padGrid, this.audioFiles.length);
            }
        });
    }

    /**
     * Refreshes audio files
     */
    private async refreshAudioFiles(): Promise<void> {
        try {
            await this.loadAudioFiles();
            this.renderPadGrid();
            this.updateUI();
        } catch (error) {
            console.error('Failed to refresh audio files:', error);
            const message = error instanceof Error ? error.message : String(error);
            this.showError('Failed to refresh audio files: ' + message);
        }
    }

    /**
     * Toggles mute
     */
    private toggleMute(): void {
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
    private async activateAudio(): Promise<void> {
        try {
            await this.audioManager.activateAudioContext();
            this.hideAudioNotice();
            
            // Start background preloading after activation
            this.audioManager.preloadRemainingFiles(this.audioFiles).catch(error => {
                console.warn('Background preloading failed:', error);
            });
        } catch (error) {
            console.error('Failed to activate audio:', error);
            const message = error instanceof Error ? error.message : String(error);
            this.showError('Failed to activate audio: ' + message);
        }
    }

    /**
     * Updates the UI
     */
    private updateUI(): void {
        this.updateFileCount(this.audioFiles.length);
    }

    /**
     * Updates file count display
     */
    private updateFileCount(count: number): void {
        const fileCountElement = document.getElementById('file-count');
        if (fileCountElement) {
            fileCountElement.textContent = count.toString();
        }
    }

    /**
     * Formats file size for display
     */
    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]!;
    }

    /**
     * Hides the loading screen
     */
    private hideLoadingScreen(): void {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (app) app.style.display = 'flex';
    }

    /**
     * Shows the audio notice
     */
    private showAudioNotice(): void {
        const audioNotice = document.getElementById('audio-notice');
        if (audioNotice) {
            audioNotice.style.display = 'block';
        }
    }

    /**
     * Hides the audio notice
     */
    private hideAudioNotice(): void {
        const audioNotice = document.getElementById('audio-notice');
        if (audioNotice) {
            audioNotice.style.display = 'none';
        }
    }

    /**
     * Hides the silent mode warning
     */
    private hideSilentModeWarning(): void {
        const silentWarning = document.getElementById('silent-mode-warning');
        if (silentWarning) {
            silentWarning.style.display = 'none';
        }
    }

    /**
     * Shows an error message
     */
    private showError(message: string): void {
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
    private hideError(): void {
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
    private soundboardController: SoundboardController;

    constructor() {
        this.soundboardController = new SoundboardController();
    }

    /**
     * Starts the application
     */
    async start(): Promise<void> {
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

// Export for potential module use (browser globals)
if (typeof window !== 'undefined') {
    (window as any).App = App;
    (window as any).SoundboardController = SoundboardController;
    (window as any).AudioManager = AudioManager;
}
