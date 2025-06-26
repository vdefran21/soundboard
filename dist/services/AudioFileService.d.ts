/**
 * Audio file service for managing and monitoring audio files
 */
import { EventEmitter } from 'events';
import { AudioFile } from '../models';
/**
 * Service class for managing audio files
 */
export declare class AudioFileService extends EventEmitter {
    private audioFiles;
    private fileWatcher;
    private readonly audioDirectory;
    constructor(audioDirectory?: string);
    /**
     * Initializes the audio file service
     */
    initialize(): Promise<void>;
    /**
     * Gets all audio files
     * @returns Array of audio files
     */
    getAllAudioFiles(): AudioFile[];
    /**
     * Gets an audio file by ID
     * @param id - Audio file ID
     * @returns Audio file or undefined if not found
     */
    getAudioFileById(id: string): AudioFile | undefined;
    /**
     * Gets audio file count
     * @returns Number of audio files
     */
    getAudioFileCount(): number;
    /**
     * Refreshes the audio file list by rescanning the directory
     */
    refresh(): Promise<void>;
    /**
     * Stops the file watcher and cleans up resources
     */
    cleanup(): Promise<void>;
    /**
     * Ensures the audio directory exists
     */
    private ensureAudioDirectory;
    /**
     * Scans the audio directory for supported audio files
     */
    private scanAudioFiles;
    /**
     * Creates audio file metadata from a filename
     * @param filename - Name of the audio file
     * @returns Promise resolving to AudioFile metadata
     */
    private createAudioFileMetadata;
    /**
     * Checks if a filename represents a supported audio file
     * @param filename - Name of the file to check
     * @returns True if file is supported
     */
    private isSupportedAudioFile;
    /**
     * Starts file system watching for the audio directory
     */
    private startFileWatching;
    /**
     * Handles file system events
     * @param event - Type of file system event
     * @param filePath - Path to the affected file
     */
    private handleFileSystemEvent;
}
//# sourceMappingURL=AudioFileService.d.ts.map