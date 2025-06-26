/**
 * Main server file for the Soundboard application
 */

import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import * as path from 'path';
import { AudioFileService } from './services/AudioFileService';
import { createApiRoutes } from './routes/api';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  corsHandler,
  validateJsonPayload,
  securityHeaders,
  validateFileSize,
} from './middleware';
import { appConfig, validateConfig, logConfig } from './utils/config';
import { getErrorMessage } from './utils';

/**
 * Soundboard application class
 */
export class SoundboardApp {
  private app: express.Application;
  private audioFileService: AudioFileService;

  constructor() {
    this.app = express();
    this.audioFileService = new AudioFileService();
    this.initialize();
  }

  /**
   * Initializes the application
   */
  private initialize(): void {
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Sets up Express middleware
   */
  private setupMiddleware(): void {
    // Security and compression
    this.app.use(helmet({
      contentSecurityPolicy: false, // We handle CSP in our custom middleware
      crossOriginEmbedderPolicy: false, // Allow audio playback
    }));
    this.app.use(compression());
    
    // Custom middleware
    this.app.use(securityHeaders);
    this.app.use(corsHandler);
    this.app.use(requestLogger);
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(validateJsonPayload);
    this.app.use(validateFileSize(appConfig.maxFileSize));

    // Static file serving
    const publicPath = path.join(process.cwd(), 'public');
    this.app.use(express.static(publicPath, {
      maxAge: '1h',
      etag: true,
      lastModified: true,
    }));

    console.log(`📁 Serving static files from: ${publicPath}`);
  }

  /**
   * Sets up application routes
   */
  private setupRoutes(): void {
    // API routes
    this.app.use('/api', createApiRoutes(this.audioFileService));

    // Serve the main application
    this.app.get('/', (_req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
    });

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        version: process.env['npm_package_version'] || '1.0.0',
        environment: appConfig.environment,
      });
    });
  }

  /**
   * Sets up error handling middleware
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Starts the server
   * @returns Promise that resolves when server is started
   */
  public async start(): Promise<void> {
    try {
      // Validate configuration
      validateConfig();
      
      // Initialize audio file service
      await this.audioFileService.initialize();
      
      // Start the server
      this.app.listen(appConfig.port, () => {
        console.log('\n🎵 Soundboard Server Started!');
        console.log(`🌐 Server running at: http://localhost:${appConfig.port}`);
        console.log(`📱 Open the soundboard at: http://localhost:${appConfig.port}`);
        logConfig();
        console.log('\n🎯 Ready to rock! Add audio files to the /audio directory.');
        console.log('📄 Press Ctrl+C to stop the server.\n');
      });

      // Handle graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      console.error('❌ Failed to start server:', getErrorMessage(error));
      process.exit(1);
    }
  }

  /**
   * Sets up graceful shutdown handling
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      
      try {
        await this.audioFileService.cleanup();
        console.log('✅ Audio file service cleaned up');
        
        console.log('👋 Soundboard server stopped. Goodbye!');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', getErrorMessage(error));
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('💥 Uncaught Exception:', error);
      void shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason: unknown) => {
      console.error('💥 Unhandled Rejection:', reason);
      void shutdown('UNHANDLED_REJECTION');
    });
  }

  /**
   * Gets the Express application instance
   * @returns Express application
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Gets the audio file service instance
   * @returns Audio file service
   */
  public getAudioFileService(): AudioFileService {
    return this.audioFileService;
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  const soundboardApp = new SoundboardApp();
  void soundboardApp.start();
}
