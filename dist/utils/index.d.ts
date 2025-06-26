/**
 * Utility functions for the Soundboard application
 */
import { SupportedAudioFormat } from '../models';
/**
 * Checks if a file extension is supported
 * @param extension - File extension to check
 * @returns True if supported, false otherwise
 */
export declare function isSupportedAudioFormat(extension: string): extension is SupportedAudioFormat;
/**
 * Gets the MIME type for an audio file extension
 * @param extension - File extension
 * @returns MIME type string
 */
export declare function getMimeType(extension: string): string;
/**
 * Generates a unique ID based on filename and timestamp
 * @param filename - Original filename
 * @returns Unique ID string
 */
export declare function generateAudioFileId(filename: string): string;
/**
 * Sanitizes a filename for display purposes
 * @param filename - Original filename
 * @returns Sanitized display name
 */
export declare function sanitizeDisplayName(filename: string): string;
/**
 * Validates file size against maximum allowed size
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if valid, false otherwise
 */
export declare function validateFileSize(size: number, maxSize: number): boolean;
/**
 * Formats file size for human-readable display
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Creates a delay promise for async operations
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Type guard to check if an error is a Node.js Error object
 * @param error - Unknown error object
 * @returns True if error is an Error instance
 */
export declare function isError(error: unknown): error is Error;
/**
 * Creates a safe error message from unknown error
 * @param error - Unknown error object
 * @returns Safe error message string
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export declare function truncateText(text: string, maxLength: number): string;
//# sourceMappingURL=index.d.ts.map