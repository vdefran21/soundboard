"use strict";
/**
 * Main server file for the Soundboard application
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundboardApp = void 0;
const compression_1 = __importDefault(require("compression"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const path = __importStar(require("path"));
const middleware_1 = require("./middleware");
const api_1 = require("./routes/api");
const AudioFileService_1 = require("./services/AudioFileService");
const utils_1 = require("./utils");
const config_1 = require("./utils/config");
/**
 * Soundboard application class
 */
class SoundboardApp {
    constructor() {
        this.app = (0, express_1.default)();
        this.audioFileService = new AudioFileService_1.AudioFileService();
        this.initialize();
    }
    /**
     * Initializes the application
     */
    initialize() {
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    /**
     * Sets up Express middleware
     */
    setupMiddleware() {
        // Security and compression
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: false, // We handle CSP in our custom middleware
            crossOriginEmbedderPolicy: false, // Allow audio playback
        }));
        this.app.use((0, compression_1.default)());
        // Custom middleware
        this.app.use(middleware_1.securityHeaders);
        this.app.use(middleware_1.corsHandler);
        this.app.use(middleware_1.requestLogger);
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(middleware_1.validateJsonPayload);
        this.app.use((0, middleware_1.validateFileSize)(config_1.appConfig.maxFileSize));
        // Static file serving
        const publicPath = path.join(process.cwd(), 'public');
        this.app.use(express_1.default.static(publicPath, {
            maxAge: '1h',
            etag: true,
            lastModified: true,
        }));
        console.log(`📁 Serving static files from: ${publicPath}`);
    }
    /**
     * Sets up application routes
     */
    setupRoutes() {
        // API routes
        this.app.use('/api', (0, api_1.createApiRoutes)(this.audioFileService));
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
                environment: config_1.appConfig.environment,
            });
        });
    }
    /**
     * Sets up error handling middleware
     */
    setupErrorHandling() {
        // 404 handler
        this.app.use(middleware_1.notFoundHandler);
        // Global error handler
        this.app.use(middleware_1.errorHandler);
    }
    /**
     * Starts the server
     * @returns Promise that resolves when server is started
     */
    async start() {
        try {
            // Validate configuration
            (0, config_1.validateConfig)();
            // Initialize audio file service
            await this.audioFileService.initialize();
            // Start the server
            this.app.listen(config_1.appConfig.port, () => {
                console.log('\n🎵 Soundboard Server Started!');
                console.log(`🌐 Server running at: http://localhost:${config_1.appConfig.port}`);
                console.log(`📱 Open the soundboard at: http://localhost:${config_1.appConfig.port}`);
                (0, config_1.logConfig)();
                console.log('\n🎯 Ready to rock! Add audio files to the /audio directory.');
                console.log('📄 Press Ctrl+C to stop the server.\n');
            });
            // Handle graceful shutdown
            this.setupGracefulShutdown();
        }
        catch (error) {
            console.error('❌ Failed to start server:', (0, utils_1.getErrorMessage)(error));
            process.exit(1);
        }
    }
    /**
     * Sets up graceful shutdown handling
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
            try {
                await this.audioFileService.cleanup();
                console.log('✅ Audio file service cleaned up');
                console.log('👋 Soundboard server stopped. Goodbye!');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Error during shutdown:', (0, utils_1.getErrorMessage)(error));
                process.exit(1);
            }
        };
        process.on('SIGTERM', () => void shutdown('SIGTERM'));
        process.on('SIGINT', () => void shutdown('SIGINT'));
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            void shutdown('UNCAUGHT_EXCEPTION');
        });
        process.on('unhandledRejection', (reason) => {
            console.error('💥 Unhandled Rejection:', reason);
            void shutdown('UNHANDLED_REJECTION');
        });
    }
    /**
     * Gets the Express application instance
     * @returns Express application
     */
    getApp() {
        return this.app;
    }
    /**
     * Gets the audio file service instance
     * @returns Audio file service
     */
    getAudioFileService() {
        return this.audioFileService;
    }
}
exports.SoundboardApp = SoundboardApp;
// Start the application if this file is run directly
if (require.main === module) {
    const soundboardApp = new SoundboardApp();
    void soundboardApp.start();
}
//# sourceMappingURL=server.js.map