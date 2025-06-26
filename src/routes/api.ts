/**
 * API routes for the Soundboard application
 */

import { Router } from 'express';
import { AudioController } from '../controllers/AudioController';
import { AudioFileService } from '../services/AudioFileService';

/**
 * Creates and configures the API routes
 * @param audioFileService - Instance of AudioFileService
 * @returns Configured Express router
 */
export function createApiRoutes(audioFileService: AudioFileService): Router {
  const router = Router();
  const audioController = new AudioController(audioFileService);

  // Audio files endpoints
  router.get('/audio-files', audioController.getAudioFiles);
  router.get('/audio-files/:id', audioController.getAudioFileById);
  router.post('/audio-files/refresh', audioController.refreshAudioFiles);
  router.get('/audio-files-stats', audioController.getAudioStats);

  // Audio streaming endpoint
  router.get('/audio/:filename', audioController.serveAudioFile);

  // Health check endpoint
  router.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'Soundboard API is healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  });

  return router;
}
