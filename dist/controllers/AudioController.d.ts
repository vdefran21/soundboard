/**
 * Controller for audio-related API endpoints
 */
import { NextFunction, Request, Response } from 'express';
import { ApiResponse, AudioFile, AudioFilesResponse } from '../models';
import { AudioFileService } from '../services/AudioFileService';
/**
 * Audio controller class for handling audio-related requests
 */
export declare class AudioController {
    private audioFileService;
    constructor(audioFileService: AudioFileService);
    /**
     * Gets all available audio files
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Express next function
     */
    getAudioFiles: (_req: Request, res: Response<AudioFilesResponse>, next: NextFunction) => Promise<void>;
    /**
     * Gets a specific audio file by ID
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Express next function
     */
    getAudioFileById: (req: Request<{
        id: string;
    }>, res: Response<ApiResponse<AudioFile>>, next: NextFunction) => Promise<void>;
    /**
     * Serves audio file content for playback
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Express next function
     */
    serveAudioFile: (req: Request<{
        filename: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Refreshes the audio file list
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Express next function
     */
    refreshAudioFiles: (_req: Request, res: Response<AudioFilesResponse>, next: NextFunction) => Promise<void>;
    /**
     * Gets audio service statistics
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Express next function
     */
    getAudioStats: (_req: Request, res: Response<ApiResponse<{
        totalFiles: number;
        totalSize: number;
        formats: Record<string, number>;
        averageSize: number;
    }>>, next: NextFunction) => Promise<void>;
    /**
     * Handles HTTP range requests for audio streaming
     * @param audioFile - Audio file metadata
     * @param range - Range header value
     * @param res - Express response object
     */
    private handleRangeRequest;
}
//# sourceMappingURL=AudioController.d.ts.map