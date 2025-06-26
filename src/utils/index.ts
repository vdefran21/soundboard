/**
 * Utility functions for the Soundboard application
 */

import * as path from 'path';
import { SupportedAudioFormat } from '../models';

/**
 * Checks if a file extension is supported
 * @param extension - File extension to check
 * @returns True if supported, false otherwise
 */
export function isSupportedAudioFormat(extension: string): extension is SupportedAudioFormat {
  const supportedFormats: SupportedAudioFormat[] = ['wav', 'mp3', 'ogg'];
  return supportedFormats.includes(extension.toLowerCase() as SupportedAudioFormat);
}

/**
 * Gets the MIME type for an audio file extension
 * @param extension - File extension
 * @returns MIME type string
 */
export function getMimeType(extension: string): string {
  const mimeTypes: Record<SupportedAudioFormat, string> = {
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
  };
  
  const normalizedExt = extension.toLowerCase().replace('.', '') as SupportedAudioFormat;
  return mimeTypes[normalizedExt] || 'application/octet-stream';
}

/**
 * Generates a unique ID based on filename and timestamp
 * @param filename - Original filename
 * @returns Unique ID string
 */
export function generateAudioFileId(filename: string): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${sanitized}_${timestamp}`;
}

/**
 * Sanitizes a filename for display purposes
 * @param filename - Original filename
 * @returns Sanitized display name
 */
export function sanitizeDisplayName(filename: string): string {
  const nameWithoutExt = path.parse(filename).name;
  return nameWithoutExt
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Validates file size against maximum allowed size
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if valid, false otherwise
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Formats file size for human-readable display
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Creates a delay promise for async operations
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Type guard to check if an error is a Node.js Error object
 * @param error - Unknown error object
 * @returns True if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Creates a safe error message from unknown error
 * @param error - Unknown error object
 * @returns Safe error message string
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
