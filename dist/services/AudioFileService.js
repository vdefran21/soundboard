"use strict";
/**
 * Audio file service for managing and monitoring audio files
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioFileService = void 0;
const chokidar_1 = require("chokidar");
const events_1 = require("events");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const utils_1 = require("../utils");
const config_1 = require("../utils/config");
/**
 * Service class for managing audio files
 */
class AudioFileService extends events_1.EventEmitter {
    constructor(audioDirectory = config_1.appConfig.audioDirectory) {
        super();
        this.audioFiles = new Map();
        this.fileWatcher = null;
        this.audioDirectory = audioDirectory;
    }
    /**
     * Initializes the audio file service
     */
    async initialize() {
        try {
            // Ensure audio directory exists
            await this.ensureAudioDirectory();
            // Scan existing files
            await this.scanAudioFiles();
            // Start file watching if enabled
            if (config_1.appConfig.enableFileWatching) {
                this.startFileWatching();
            }
            console.log(`🎵 Audio File Service initialized with ${this.audioFiles.size} files`);
        }
        catch (error) {
            console.error('❌ Failed to initialize Audio File Service:', (0, utils_1.getErrorMessage)(error));
            throw error;
        }
    }
    /**
     * Gets all audio files
     * @returns Array of audio files
     */
    getAllAudioFiles() {
        return Array.from(this.audioFiles.values());
    }
    /**
     * Gets an audio file by ID
     * @param id - Audio file ID
     * @returns Audio file or undefined if not found
     */
    getAudioFileById(id) {
        return this.audioFiles.get(id);
    }
    /**
     * Gets audio file count
     * @returns Number of audio files
     */
    getAudioFileCount() {
        return this.audioFiles.size;
    }
    /**
     * Refreshes the audio file list by rescanning the directory
     */
    async refresh() {
        this.audioFiles.clear();
        await this.scanAudioFiles();
        this.emit('refresh', this.getAllAudioFiles());
    }
    /**
     * Stops the file watcher and cleans up resources
     */
    async cleanup() {
        if (this.fileWatcher) {
            await this.fileWatcher.close();
            this.fileWatcher = null;
        }
        this.audioFiles.clear();
        this.removeAllListeners();
    }
    /**
     * Ensures the audio directory exists
     */
    async ensureAudioDirectory() {
        try {
            await fs.access(this.audioDirectory);
        }
        catch {
            try {
                await fs.mkdir(this.audioDirectory, { recursive: true });
                console.log(`📁 Created audio directory: ${this.audioDirectory}`);
            }
            catch (error) {
                throw new Error(`Failed to create audio directory: ${(0, utils_1.getErrorMessage)(error)}`);
            }
        }
    }
    /**
     * Scans the audio directory for supported audio files
     */
    async scanAudioFiles() {
        try {
            const files = await fs.readdir(this.audioDirectory);
            const audioFilePromises = files
                .filter(filename => this.isSupportedAudioFile(filename))
                .map(filename => this.createAudioFileMetadata(filename));
            const audioFileResults = await Promise.allSettled(audioFilePromises);
            audioFileResults.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    this.audioFiles.set(result.value.id, result.value);
                }
                else if (result.status === 'rejected') {
                    console.warn(`⚠️  Failed to process audio file ${files[index]}: ${result.reason}`);
                }
            });
        }
        catch (error) {
            throw new Error(`Failed to scan audio directory: ${(0, utils_1.getErrorMessage)(error)}`);
        }
    }
    /**
     * Creates audio file metadata from a filename
     * @param filename - Name of the audio file
     * @returns Promise resolving to AudioFile metadata
     */
    async createAudioFileMetadata(filename) {
        try {
            const filePath = path.join(this.audioDirectory, filename);
            const stats = await fs.stat(filePath);
            if (!stats.isFile()) {
                return null;
            }
            // Validate file size
            if (!(0, utils_1.validateFileSize)(stats.size, config_1.appConfig.maxFileSize)) {
                console.warn(`⚠️  File ${filename} exceeds maximum size limit`);
                return null;
            }
            const extension = path.extname(filename).toLowerCase().slice(1);
            const id = (0, utils_1.generateAudioFileId)(filename);
            const displayName = (0, utils_1.sanitizeDisplayName)(filename);
            return {
                id,
                filename,
                displayName,
                extension,
                size: stats.size,
                path: filePath,
                url: `/api/audio/${encodeURIComponent(filename)}`,
                mimeType: (0, utils_1.getMimeType)(extension),
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
            };
        }
        catch (error) {
            console.error(`Failed to create metadata for ${filename}:`, (0, utils_1.getErrorMessage)(error));
            return null;
        }
    }
    /**
     * Checks if a filename represents a supported audio file
     * @param filename - Name of the file to check
     * @returns True if file is supported
     */
    isSupportedAudioFile(filename) {
        const extension = path.extname(filename).toLowerCase().slice(1);
        return (0, utils_1.isSupportedAudioFormat)(extension);
    }
    /**
     * Starts file system watching for the audio directory
     */
    startFileWatching() {
        this.fileWatcher = (0, chokidar_1.watch)(this.audioDirectory, {
            ignored: /^\./, // Ignore hidden files
            persistent: true,
            ignoreInitial: true, // Don't emit events for existing files
        });
        this.fileWatcher
            .on('add', (filePath) => this.handleFileSystemEvent('add', filePath))
            .on('change', (filePath) => this.handleFileSystemEvent('change', filePath))
            .on('unlink', (filePath) => this.handleFileSystemEvent('unlink', filePath))
            .on('error', (error) => {
            console.error('❌ File watcher error:', (0, utils_1.getErrorMessage)(error));
        });
        console.log('👀 File watching enabled for audio directory');
    }
    /**
     * Handles file system events
     * @param event - Type of file system event
     * @param filePath - Path to the affected file
     */
    async handleFileSystemEvent(event, filePath) {
        const filename = path.basename(filePath);
        if (!this.isSupportedAudioFile(filename)) {
            return;
        }
        try {
            const change = {
                event,
                path: filePath,
                timestamp: new Date(),
            };
            switch (event) {
                case 'add':
                case 'change':
                    const audioFile = await this.createAudioFileMetadata(filename);
                    if (audioFile) {
                        this.audioFiles.set(audioFile.id, audioFile);
                        change.audioFile = audioFile;
                        console.log(`${event === 'add' ? '➕' : '🔄'} Audio file ${event}: ${filename}`);
                        this.emit('fileChange', change);
                    }
                    break;
                case 'unlink':
                    // Find and remove the deleted file
                    const fileToRemove = Array.from(this.audioFiles.values())
                        .find(file => file.filename === filename);
                    if (fileToRemove) {
                        this.audioFiles.delete(fileToRemove.id);
                        console.log(`➖ Audio file removed: ${filename}`);
                        this.emit('fileChange', change);
                    }
                    break;
            }
        }
        catch (error) {
            console.error(`Failed to handle ${event} event for ${filename}:`, (0, utils_1.getErrorMessage)(error));
        }
    }
}
exports.AudioFileService = AudioFileService;
//# sourceMappingURL=AudioFileService.js.map