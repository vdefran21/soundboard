"use strict";
/**
 * API routes for the Soundboard application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRoutes = createApiRoutes;
const express_1 = require("express");
const AudioController_1 = require("../controllers/AudioController");
/**
 * Creates and configures the API routes
 * @param audioFileService - Instance of AudioFileService
 * @returns Configured Express router
 */
function createApiRoutes(audioFileService) {
    const router = (0, express_1.Router)();
    const audioController = new AudioController_1.AudioController(audioFileService);
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
//# sourceMappingURL=api.js.map