/**
 * Main server file for the Soundboard application
 */
import express from 'express';
import { AudioFileService } from './services/AudioFileService';
/**
 * Soundboard application class
 */
export declare class SoundboardApp {
    private app;
    private audioFileService;
    constructor();
    /**
     * Initializes the application
     */
    private initialize;
    /**
     * Sets up Express middleware
     */
    private setupMiddleware;
    /**
     * Sets up application routes
     */
    private setupRoutes;
    /**
     * Sets up error handling middleware
     */
    private setupErrorHandling;
    /**
     * Starts the server
     * @returns Promise that resolves when server is started
     */
    start(): Promise<void>;
    /**
     * Sets up graceful shutdown handling
     */
    private setupGracefulShutdown;
    /**
     * Gets the Express application instance
     * @returns Express application
     */
    getApp(): express.Application;
    /**
     * Gets the audio file service instance
     * @returns Audio file service
     */
    getAudioFileService(): AudioFileService;
}
//# sourceMappingURL=server.d.ts.map