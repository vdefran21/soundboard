"use strict";
/**
 * Controller for audio-related API endpoints
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
exports.AudioController = void 0;
const utils_1 = require("../utils");
/**
 * Audio controller class for handling audio-related requests
 */
class AudioController {
    constructor(audioFileService) {
        this.audioFileService = audioFileService;
        /**
         * Gets all available audio files
         * @param req - Express request object
         * @param res - Express response object
         * @param next - Express next function
         */
        this.getAudioFiles = async (_req, res, next) => {
            try {
                const audioFiles = this.audioFileService.getAllAudioFiles();
                const count = this.audioFileService.getAudioFileCount();
                const response = {
                    success: true,
                    data: audioFiles,
                    count,
                    message: `Retrieved ${count} audio files`,
                };
                res.json(response);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Gets a specific audio file by ID
         * @param req - Express request object
         * @param res - Express response object
         * @param next - Express next function
         */
        this.getAudioFileById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const audioFile = this.audioFileService.getAudioFileById(id);
                if (!audioFile) {
                    const error = new Error(`Audio file with ID ${id} not found`);
                    error.statusCode = 404;
                    return next(error);
                }
                const response = {
                    success: true,
                    data: audioFile,
                    message: `Retrieved audio file: ${audioFile.displayName}`,
                };
                res.json(response);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Serves audio file content for playback
         * @param req - Express request object
         * @param res - Express response object
         * @param next - Express next function
         */
        this.serveAudioFile = async (req, res, next) => {
            try {
                const { filename } = req.params;
                const decodedFilename = decodeURIComponent(filename);
                // Find the audio file by filename
                const audioFile = this.audioFileService.getAllAudioFiles()
                    .find(file => file.filename === decodedFilename);
                if (!audioFile) {
                    const error = new Error(`Audio file ${decodedFilename} not found`);
                    error.statusCode = 404;
                    return next(error);
                }
                // Set appropriate headers for audio streaming
                res.setHeader('Content-Type', audioFile.mimeType);
                res.setHeader('Content-Length', audioFile.size.toString());
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
                res.setHeader('Content-Disposition', `inline; filename="${audioFile.filename}"`);
                // Handle range requests for audio streaming
                const range = req.headers.range;
                if (range) {
                    await this.handleRangeRequest(audioFile, range, res);
                }
                else {
                    // Send entire file
                    res.sendFile(audioFile.path);
                }
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Refreshes the audio file list
         * @param req - Express request object
         * @param res - Express response object
         * @param next - Express next function
         */
        this.refreshAudioFiles = async (_req, res, next) => {
            try {
                await this.audioFileService.refresh();
                const audioFiles = this.audioFileService.getAllAudioFiles();
                const count = this.audioFileService.getAudioFileCount();
                const response = {
                    success: true,
                    data: audioFiles,
                    count,
                    message: `Refreshed audio files. Found ${count} files.`,
                };
                res.json(response);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Gets audio service statistics
         * @param req - Express request object
         * @param res - Express response object
         * @param next - Express next function
         */
        this.getAudioStats = async (_req, res, next) => {
            try {
                const audioFiles = this.audioFileService.getAllAudioFiles();
                const totalFiles = audioFiles.length;
                const totalSize = audioFiles.reduce((sum, file) => sum + file.size, 0);
                const averageSize = totalFiles > 0 ? totalSize / totalFiles : 0;
                // Count files by format
                const formats = {};
                audioFiles.forEach(file => {
                    formats[file.extension] = (formats[file.extension] || 0) + 1;
                });
                const response = {
                    success: true,
                    data: {
                        totalFiles,
                        totalSize,
                        formats,
                        averageSize,
                    },
                    message: 'Retrieved audio statistics',
                };
                res.json(response);
            }
            catch (error) {
                next(error);
            }
        };
    }
    /**
     * Handles HTTP range requests for audio streaming
     * @param audioFile - Audio file metadata
     * @param range - Range header value
     * @param res - Express response object
     */
    async handleRangeRequest(audioFile, range, res) {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);
            if (!rangeMatch) {
                res.status(416).end();
                return;
            }
            const start = parseInt(rangeMatch[1], 10);
            const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : audioFile.size - 1;
            if (start >= audioFile.size || end >= audioFile.size) {
                res.status(416).end();
                return;
            }
            const chunkSize = (end - start) + 1;
            const fileStream = fs.createReadStream(audioFile.path, { start, end });
            res.status(206);
            res.setHeader('Content-Range', `bytes ${start}-${end}/${audioFile.size}`);
            res.setHeader('Content-Length', chunkSize.toString());
            fileStream.pipe(res);
        }
        catch (error) {
            console.error('Error handling range request:', (0, utils_1.getErrorMessage)(error));
            res.status(500).end();
        }
    }
}
exports.AudioController = AudioController;
//# sourceMappingURL=AudioController.js.map