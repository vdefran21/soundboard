"use strict";
/**
 * Configuration management for the Soundboard application
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
exports.appConfig = void 0;
exports.validateConfig = validateConfig;
exports.logConfig = logConfig;
const dotenv_1 = require("dotenv");
const path = __importStar(require("path"));
// Load environment variables
(0, dotenv_1.config)();
/**
 * Gets configuration value with type checking and default fallback
 * @param key - Environment variable key
 * @param defaultValue - Default value if environment variable is not set
 * @returns Configuration value
 */
function getConfigValue(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined) {
        return defaultValue;
    }
    // Type conversion based on default value type
    if (typeof defaultValue === 'number') {
        const numValue = parseInt(value, 10);
        return (isNaN(numValue) ? defaultValue : numValue);
    }
    if (typeof defaultValue === 'boolean') {
        return (value.toLowerCase() === 'true');
    }
    return value;
}
/**
 * Application configuration object
 */
exports.appConfig = {
    port: getConfigValue('PORT', 3000),
    audioDirectory: getConfigValue('AUDIO_DIRECTORY', path.join(process.cwd(), 'audio')),
    maxFileSize: getConfigValue('MAX_FILE_SIZE', 50 * 1024 * 1024), // 50MB default
    supportedExtensions: ['wav', 'mp3', 'ogg'],
    enableFileWatching: getConfigValue('ENABLE_FILE_WATCHING', true),
    corsOrigin: getConfigValue('CORS_ORIGIN', '*'),
    environment: getConfigValue('NODE_ENV', 'development'),
};
/**
 * Validates the configuration
 * @returns True if configuration is valid, throws error otherwise
 */
function validateConfig() {
    if (exports.appConfig.port < 1 || exports.appConfig.port > 65535) {
        throw new Error(`Invalid port number: ${exports.appConfig.port}`);
    }
    if (exports.appConfig.maxFileSize <= 0) {
        throw new Error(`Invalid max file size: ${exports.appConfig.maxFileSize}`);
    }
    if (!exports.appConfig.audioDirectory || exports.appConfig.audioDirectory.trim() === '') {
        throw new Error('Audio directory path cannot be empty');
    }
    return true;
}
/**
 * Logs the current configuration (excluding sensitive data)
 */
function logConfig() {
    console.log('🔧 Soundboard Configuration:');
    console.log(`   Port: ${exports.appConfig.port}`);
    console.log(`   Audio Directory: ${exports.appConfig.audioDirectory}`);
    console.log(`   Max File Size: ${(exports.appConfig.maxFileSize / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`   Supported Extensions: ${exports.appConfig.supportedExtensions.join(', ')}`);
    console.log(`   File Watching: ${exports.appConfig.enableFileWatching ? 'Enabled' : 'Disabled'}`);
    console.log(`   CORS Origin: ${exports.appConfig.corsOrigin}`);
    console.log(`   Environment: ${exports.appConfig.environment}`);
}
//# sourceMappingURL=config.js.map