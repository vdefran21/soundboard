/**
 * Controller for audio-related API endpoints
 */

import { NextFunction, Request, Response } from 'express';
import { ApiResponse, AudioFile, AudioFilesResponse } from '../models';
import { AudioFileService } from '../services/AudioFileService';
import { getErrorMessage } from '../utils';

/**
 * Audio controller class for handling audio-related requests
 */
export class AudioController {
  constructor(private audioFileService: AudioFileService) {}

  /**
   * Gets all available audio files
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  public getAudioFiles = async (
    _req: Request, 
    res: Response<AudioFilesResponse>, 
    next: NextFunction
  ): Promise<void> => {
    try {
      const audioFiles = this.audioFileService.getAllAudioFiles();
      const count = this.audioFileService.getAudioFileCount();

      const response: AudioFilesResponse = {
        success: true,
        data: audioFiles,
        count,
        message: `Retrieved ${count} audio files`,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gets a specific audio file by ID
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  public getAudioFileById = async (
    req: Request<{ id: string }>, 
    res: Response<ApiResponse<AudioFile>>, 
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const audioFile = this.audioFileService.getAudioFileById(id);

      if (!audioFile) {
        const error = new Error(`Audio file with ID ${id} not found`);
        (error as any).statusCode = 404;
        return next(error);
      }

      const response: ApiResponse<AudioFile> = {
        success: true,
        data: audioFile,
        message: `Retrieved audio file: ${audioFile.displayName}`,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Serves audio file content for playback
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  public serveAudioFile = async (
    req: Request<{ filename: string }>, 
    res: Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      const { filename } = req.params;
      const decodedFilename = decodeURIComponent(filename);
      
      // Find the audio file by filename
      const audioFile = this.audioFileService.getAllAudioFiles()
        .find(file => file.filename === decodedFilename);

      if (!audioFile) {
        const error = new Error(`Audio file ${decodedFilename} not found`);
        (error as any).statusCode = 404;
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
      } else {
        // Send entire file
        res.sendFile(audioFile.path);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refreshes the audio file list
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  public refreshAudioFiles = async (
    _req: Request, 
    res: Response<AudioFilesResponse>, 
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.audioFileService.refresh();
      const audioFiles = this.audioFileService.getAllAudioFiles();
      const count = this.audioFileService.getAudioFileCount();

      const response: AudioFilesResponse = {
        success: true,
        data: audioFiles,
        count,
        message: `Refreshed audio files. Found ${count} files.`,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gets audio service statistics
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  public getAudioStats = async (
    _req: Request, 
    res: Response<ApiResponse<{
      totalFiles: number;
      totalSize: number;
      formats: Record<string, number>;
      averageSize: number;
    }>>, 
    next: NextFunction
  ): Promise<void> => {
    try {
      const audioFiles = this.audioFileService.getAllAudioFiles();
      const totalFiles = audioFiles.length;
      const totalSize = audioFiles.reduce((sum, file) => sum + file.size, 0);
      const averageSize = totalFiles > 0 ? totalSize / totalFiles : 0;

      // Count files by format
      const formats: Record<string, number> = {};
      audioFiles.forEach(file => {
        formats[file.extension] = (formats[file.extension] || 0) + 1;
      });

      const response: ApiResponse<{
        totalFiles: number;
        totalSize: number;
        formats: Record<string, number>;
        averageSize: number;
      }> = {
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
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles HTTP range requests for audio streaming
   * @param audioFile - Audio file metadata
   * @param range - Range header value
   * @param res - Express response object
   */
  private async handleRangeRequest(
    audioFile: AudioFile, 
    range: string, 
    res: Response
  ): Promise<void> {
    try {
      const fs = await import('fs');
      const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);
      
      if (!rangeMatch) {
        res.status(416).end();
        return;
      }

      const start = parseInt(rangeMatch[1]!, 10);
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
    } catch (error) {
      console.error('Error handling range request:', getErrorMessage(error));
      res.status(500).end();
    }
  }
}
