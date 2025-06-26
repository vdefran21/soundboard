/**
 * Core interfaces and types for the Soundboard application
 */

/**
 * Represents an audio file with metadata
 */
export interface AudioFile {
  /** Unique identifier for the audio file */
  id: string;
  /** Original filename */
  filename: string;
  /** Display name for the pad */
  displayName: string;
  /** File extension */
  extension: string;
  /** File size in bytes */
  size: number;
  /** Duration in seconds (if available) */
  duration?: number;
  /** File path relative to audio directory */
  path: string;
  /** URL path for serving the file */
  url: string;
  /** MIME type */
  mimeType: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last modified timestamp */
  modifiedAt: Date;
}

/**
 * Supported audio file formats
 */
export type SupportedAudioFormat = 'wav' | 'mp3' | 'ogg';

/**
 * API response for audio files endpoint
 */
export interface AudioFilesResponse {
  /** Success status */
  success: boolean;
  /** Array of audio files */
  data: AudioFile[];
  /** Total count of files */
  count: number;
  /** Response message */
  message?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  /** Success status (always false for errors) */
  success: false;
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: unknown;
  /** Timestamp of error */
  timestamp: Date;
}

/**
 * API response wrapper type
 */
export type ApiResponse<T> = {
  success: true;
  data: T;
  message?: string;
} | ErrorResponse;

/**
 * Configuration interface
 */
export interface AppConfig {
  /** Server port */
  port: number;
  /** Audio directory path */
  audioDirectory: string;
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Supported file extensions */
  supportedExtensions: SupportedAudioFormat[];
  /** Enable file watching */
  enableFileWatching: boolean;
  /** CORS origin */
  corsOrigin: string;
  /** Environment */
  environment: 'development' | 'production' | 'test';
}

/**
 * Pad configuration for the frontend
 */
export interface PadConfig {
  /** Pad index (0-15 for 4x4 grid) */
  index: number;
  /** Associated audio file ID */
  audioFileId?: string;
  /** Custom display name */
  displayName?: string;
  /** Pad color theme */
  color?: string;
  /** Volume level (0-1) */
  volume: number;
  /** Whether pad is muted */
  muted: boolean;
}

/**
 * Soundboard state interface
 */
export interface SoundboardState {
  /** Array of pad configurations */
  pads: PadConfig[];
  /** Master volume (0-1) */
  masterVolume: number;
  /** Whether soundboard is muted */
  muted: boolean;
  /** Current audio context state */
  audioContextState: 'suspended' | 'running' | 'closed';
}

/**
 * File system event types
 */
export type FileSystemEvent = 'add' | 'change' | 'unlink';

/**
 * File system change notification
 */
export interface FileSystemChange {
  /** Event type */
  event: FileSystemEvent;
  /** File path */
  path: string;
  /** Audio file data (for add/change events) */
  audioFile?: AudioFile;
  /** Timestamp */
  timestamp: Date;
}
