"use strict";
/**
 * Utility functions for the Soundboard application
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
exports.isSupportedAudioFormat = isSupportedAudioFormat;
exports.getMimeType = getMimeType;
exports.generateAudioFileId = generateAudioFileId;
exports.sanitizeDisplayName = sanitizeDisplayName;
exports.validateFileSize = validateFileSize;
exports.formatFileSize = formatFileSize;
exports.delay = delay;
exports.isError = isError;
exports.getErrorMessage = getErrorMessage;
exports.truncateText = truncateText;
const path = __importStar(require("path"));
/**
 * Checks if a file extension is supported
 * @param extension - File extension to check
 * @returns True if supported, false otherwise
 */
function isSupportedAudioFormat(extension) {
    const supportedFormats = ['wav', 'mp3', 'ogg'];
    return supportedFormats.includes(extension.toLowerCase());
}
/**
 * Gets the MIME type for an audio file extension
 * @param extension - File extension
 * @returns MIME type string
 */
function getMimeType(extension) {
    const mimeTypes = {
        wav: 'audio/wav',
        mp3: 'audio/mpeg',
        ogg: 'audio/ogg',
    };
    const normalizedExt = extension.toLowerCase().replace('.', '');
    return mimeTypes[normalizedExt] || 'application/octet-stream';
}
/**
 * Generates a unique ID based on filename and timestamp
 * @param filename - Original filename
 * @returns Unique ID string
 */
function generateAudioFileId(filename) {
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${sanitized}_${timestamp}`;
}
/**
 * Sanitizes a filename for display purposes
 * @param filename - Original filename
 * @returns Sanitized display name
 */
function sanitizeDisplayName(filename) {
    const nameWithoutExt = path.parse(filename).name;
    return nameWithoutExt
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
/**
 * Validates file size against maximum allowed size
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if valid, false otherwise
 */
function validateFileSize(size, maxSize) {
    return size > 0 && size <= maxSize;
}
/**
 * Formats file size for human-readable display
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
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
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Type guard to check if an error is a Node.js Error object
 * @param error - Unknown error object
 * @returns True if error is an Error instance
 */
function isError(error) {
    return error instanceof Error;
}
/**
 * Creates a safe error message from unknown error
 * @param error - Unknown error object
 * @returns Safe error message string
 */
function getErrorMessage(error) {
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
function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength - 3) + '...';
}
//# sourceMappingURL=index.js.map