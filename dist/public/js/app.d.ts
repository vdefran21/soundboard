/**
 * Frontend TypeScript application for the Akai MPD2 Soundboard
 */
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
declare class AudioManager {
    private audioElements;
    private masterVolume;
    private muted;
    private audioContextState;
    private userInteracted;
    private isMobile;
    constructor();
    /**
     * Sets up detection for user interaction (required for Chrome mobile)
     */
    private setupUserInteractionDetection;
    /**
     * Initializes the audio system using HTML5 Audio elements
     */
    initialize(): Promise<void>;
    /**
     * Activates the audio context (enhanced for Chrome mobile compatibility)
     */
    activateAudioContext(): Promise<void>;
    /**
     * Unlocks audio for mobile browsers (especially Chrome mobile)
     */
    private unlockAudioForMobile;
    /**
     * Loads an audio file and creates an HTML5 Audio element (enhanced for Chrome mobile)
     */
    loadAudioFile(audioFile: AudioFile): Promise<void>;
    /**
     * Plays an audio file using HTML5 Audio (enhanced for Chrome mobile)
     */
    playAudio(audioFileId: string, volume?: number): Promise<void>;
    /**
     * Sets the master volume
     */
    setMasterVolume(volume: number): void;
    /**
     * Gets the current master volume
     */
    getMasterVolume(): number;
    /**
     * Toggles mute state
     */
    toggleMute(): boolean;
    /**
     * Gets the mute state
     */
    isMuted(): boolean;
    /**
     * Gets the audio context state
     */
    getAudioContextState(): AppAudioState;
    /**
     * Checks if an audio file is already loaded
     */
    isAudioLoaded(audioFileId: string): boolean;
    /**
     * Updates the audio context status in the UI
     */
    private updateAudioContextStatus;
    /**
     * Preloads all audio files
     */
    preloadAudioFiles(audioFiles: AudioFile[]): Promise<void>;
    /**
     * Preloads remaining audio files in the background
     */
    preloadRemainingFiles(audioFiles: AudioFile[]): Promise<void>;
}
/**
 * Soundboard Controller class for managing the pad interface
 */
declare class SoundboardController {
    private audioManager;
    private audioFiles;
    private state;
    constructor();
    /**
     * Initializes the soundboard
     */
    initialize(): Promise<void>;
    /**
     * Loads audio files from the API
     */
    private loadAudioFiles;
    /**
     * Sets up the user interface
     */
    private setupUI;
    /**
     * Renders the pad grid - now supports any number of audio files
     */
    private renderPadGrid;
    /**
     * Updates the CSS grid layout based on number of pads and screen size
     */
    private updateGridLayout;
    /**
     * Creates a pad element
     */
    private createPadElement;
    /**
     * Handles pad click/activation
     */
    private handlePadClick;
    /**
     * Initializes pad configurations based on actual audio files count
     */
    private initializePads;
    /**
     * Sets up volume control
     */
    private setupVolumeControl;
    /**
     * Sets the master volume
     */
    private setMasterVolume;
    /**
     * Binds event listeners
     */
    private bindEvents;
    /**
     * Refreshes audio files
     */
    private refreshAudioFiles;
    /**
     * Toggles mute
     */
    private toggleMute;
    /**
     * Activates audio context
     */
    private activateAudio;
    /**
     * Updates the UI
     */
    private updateUI;
    /**
     * Updates file count display
     */
    private updateFileCount;
    /**
     * Formats file size for display
     */
    private formatFileSize;
    /**
     * Hides the loading screen
     */
    private hideLoadingScreen;
    /**
     * Shows the audio notice
     */
    private showAudioNotice;
    /**
     * Hides the audio notice
     */
    private hideAudioNotice;
    /**
     * Hides the silent mode warning
     */
    private hideSilentModeWarning;
    /**
     * Shows an error message
     */
    private showError;
    /**
     * Hides the error message
     */
    private hideError;
    /**
     * Updates initial status displays
     */
    private updateInitialStatus;
}
/**
 * Application initialization
 */
declare class App {
    private soundboardController;
    constructor();
    /**
     * Starts the application
     */
    start(): Promise<void>;
}
//# sourceMappingURL=app.d.ts.map