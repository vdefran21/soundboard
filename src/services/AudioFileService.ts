/**
 * Audio file service for managing and monitoring audio files
 */

import { FSWatcher, watch } from 'chokidar';
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  AudioFile,
  FileSystemChange,
  FileSystemEvent,
  SupportedAudioFormat
} from '../models';
import {
  generateAudioFileId,
  getErrorMessage,
  getMimeType,
  isSupportedAudioFormat,
  sanitizeDisplayName,
  validateFileSize
} from '../utils';
import { appConfig } from '../utils/config';

/**
 * Service class for managing audio files
 */
export class AudioFileService extends EventEmitter {
  private audioFiles: Map<string, AudioFile> = new Map();
  private fileWatcher: FSWatcher | null = null;
  private readonly audioDirectory: string;

  constructor(audioDirectory: string = appConfig.audioDirectory) {
    super();
    this.audioDirectory = audioDirectory;
  }

  /**
   * Initializes the audio file service
   */
  public async initialize(): Promise<void> {
    try {
      // Ensure audio directory exists
      await this.ensureAudioDirectory();
      
      // Scan existing files
      await this.scanAudioFiles();
      
      // Start file watching if enabled
      if (appConfig.enableFileWatching) {
        this.startFileWatching();
      }
      
      console.log(`🎵 Audio File Service initialized with ${this.audioFiles.size} files`);
    } catch (error) {
      console.error('❌ Failed to initialize Audio File Service:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Gets all audio files
   * @returns Array of audio files
   */
  public getAllAudioFiles(): AudioFile[] {
    return Array.from(this.audioFiles.values());
  }

  /**
   * Gets an audio file by ID
   * @param id - Audio file ID
   * @returns Audio file or undefined if not found
   */
  public getAudioFileById(id: string): AudioFile | undefined {
    return this.audioFiles.get(id);
  }

  /**
   * Gets audio file count
   * @returns Number of audio files
   */
  public getAudioFileCount(): number {
    return this.audioFiles.size;
  }

  /**
   * Refreshes the audio file list by rescanning the directory
   */
  public async refresh(): Promise<void> {
    this.audioFiles.clear();
    await this.scanAudioFiles();
    this.emit('refresh', this.getAllAudioFiles());
  }

  /**
   * Stops the file watcher and cleans up resources
   */
  public async cleanup(): Promise<void> {
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
  private async ensureAudioDirectory(): Promise<void> {
    try {
      await fs.access(this.audioDirectory);
    } catch {
      try {
        await fs.mkdir(this.audioDirectory, { recursive: true });
        console.log(`📁 Created audio directory: ${this.audioDirectory}`);
      } catch (error) {
        throw new Error(`Failed to create audio directory: ${getErrorMessage(error)}`);
      }
    }
  }

  /**
   * Scans the audio directory for supported audio files
   */
  private async scanAudioFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.audioDirectory);
      const audioFilePromises = files
        .filter(filename => this.isSupportedAudioFile(filename))
        .map(filename => this.createAudioFileMetadata(filename));

      const audioFileResults = await Promise.allSettled(audioFilePromises);
      
      audioFileResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          this.audioFiles.set(result.value.id, result.value);
        } else if (result.status === 'rejected') {
          console.warn(`⚠️  Failed to process audio file ${files[index]}: ${result.reason}`);
        }
      });

    } catch (error) {
      throw new Error(`Failed to scan audio directory: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Creates audio file metadata from a filename
   * @param filename - Name of the audio file
   * @returns Promise resolving to AudioFile metadata
   */
  private async createAudioFileMetadata(filename: string): Promise<AudioFile | null> {
    try {
      const filePath = path.join(this.audioDirectory, filename);
      const stats = await fs.stat(filePath);
      
      if (!stats.isFile()) {
        return null;
      }

      // Validate file size
      if (!validateFileSize(stats.size, appConfig.maxFileSize)) {
        console.warn(`⚠️  File ${filename} exceeds maximum size limit`);
        return null;
      }

      const extension = path.extname(filename).toLowerCase().slice(1) as SupportedAudioFormat;
      const id = generateAudioFileId(filename);
      const displayName = sanitizeDisplayName(filename);
      
      return {
        id,
        filename,
        displayName,
        extension,
        size: stats.size,
        path: filePath,
        url: `/api/audio/${encodeURIComponent(filename)}`,
        mimeType: getMimeType(extension),
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      console.error(`Failed to create metadata for ${filename}:`, getErrorMessage(error));
      return null;
    }
  }

  /**
   * Checks if a filename represents a supported audio file
   * @param filename - Name of the file to check
   * @returns True if file is supported
   */
  private isSupportedAudioFile(filename: string): boolean {
    const extension = path.extname(filename).toLowerCase().slice(1);
    return isSupportedAudioFormat(extension);
  }

  /**
   * Starts file system watching for the audio directory
   */
  private startFileWatching(): void {
    this.fileWatcher = watch(this.audioDirectory, {
      ignored: /^\./, // Ignore hidden files
      persistent: true,
      ignoreInitial: true, // Don't emit events for existing files
    });

    this.fileWatcher
      .on('add', (filePath: string) => this.handleFileSystemEvent('add', filePath))
      .on('change', (filePath: string) => this.handleFileSystemEvent('change', filePath))
      .on('unlink', (filePath: string) => this.handleFileSystemEvent('unlink', filePath))
      .on('error', (error: Error) => {
        console.error('❌ File watcher error:', getErrorMessage(error));
      });

    console.log('👀 File watching enabled for audio directory');
  }

  /**
   * Handles file system events
   * @param event - Type of file system event
   * @param filePath - Path to the affected file
   */
  private async handleFileSystemEvent(event: FileSystemEvent, filePath: string): Promise<void> {
    const filename = path.basename(filePath);
    
    if (!this.isSupportedAudioFile(filename)) {
      return;
    }

    try {
      const change: FileSystemChange = {
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
    } catch (error) {
      console.error(`Failed to handle ${event} event for ${filename}:`, getErrorMessage(error));
    }
  }
}
