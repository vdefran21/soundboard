/**
 * Frontend TypeScript application for the Akai MPD2 Soundboard
 */
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
    count?: number;
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
    audioContextState: AudioContextState;
}
/**
 * Audio Manager class for handling Web Audio API
 */
declare class AudioManager {
    private audioContext;
    private audioBuffers;
    private masterGainNode;
    private masterVolume;
    private muted;
    /**
     * Initializes the audio context
     */
    initialize(): Promise<void>;
    /**
     * Activates the audio context (required for user interaction)
     */
    activateAudioContext(): Promise<void>;
    /**
     * Loads an audio file and stores its buffer
     */
    loadAudioFile(audioFile: AudioFile): Promise<void>;
    /**
     * Plays an audio file
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
    getAudioContextState(): AudioContextState;
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
     * Preloads all audio files in the background (optional optimization)
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
     * Shows an error message
     */
    private showError;
    /**
     * Hides the error message
     */
    private hideError;
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