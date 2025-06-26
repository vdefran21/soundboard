/**
 * Configuration management for the Soundboard application
 */

import { config } from 'dotenv';
import * as path from 'path';
import { AppConfig, SupportedAudioFormat } from '../models';

// Load environment variables
config();

/**
 * Gets configuration value with type checking and default fallback
 * @param key - Environment variable key
 * @param defaultValue - Default value if environment variable is not set
 * @returns Configuration value
 */
function getConfigValue<T>(key: string, defaultValue: T): T {
  const value = process.env[key];
  
  if (value === undefined) {
    return defaultValue;
  }
  
  // Type conversion based on default value type
  if (typeof defaultValue === 'number') {
    const numValue = parseInt(value, 10);
    return (isNaN(numValue) ? defaultValue : numValue) as T;
  }
  
  if (typeof defaultValue === 'boolean') {
    return (value.toLowerCase() === 'true') as T;
  }
  
  return value as T;
}

/**
 * Application configuration object
 */
export const appConfig: AppConfig = {
  port: getConfigValue('PORT', 3000),
  audioDirectory: getConfigValue('AUDIO_DIRECTORY', path.join(process.cwd(), 'audio')),
  maxFileSize: getConfigValue('MAX_FILE_SIZE', 50 * 1024 * 1024), // 50MB default
  supportedExtensions: ['wav', 'mp3', 'ogg'] as SupportedAudioFormat[],
  enableFileWatching: getConfigValue('ENABLE_FILE_WATCHING', true),
  corsOrigin: getConfigValue('CORS_ORIGIN', '*'),
  environment: getConfigValue('NODE_ENV', 'development') as 'development' | 'production' | 'test',
};

/**
 * Validates the configuration
 * @returns True if configuration is valid, throws error otherwise
 */
export function validateConfig(): boolean {
  if (appConfig.port < 1 || appConfig.port > 65535) {
    throw new Error(`Invalid port number: ${appConfig.port}`);
  }
  
  if (appConfig.maxFileSize <= 0) {
    throw new Error(`Invalid max file size: ${appConfig.maxFileSize}`);
  }
  
  if (!appConfig.audioDirectory || appConfig.audioDirectory.trim() === '') {
    throw new Error('Audio directory path cannot be empty');
  }
  
  return true;
}

/**
 * Logs the current configuration (excluding sensitive data)
 */
export function logConfig(): void {
  console.log('🔧 Soundboard Configuration:');
  console.log(`   Port: ${appConfig.port}`);
  console.log(`   Audio Directory: ${appConfig.audioDirectory}`);
  console.log(`   Max File Size: ${(appConfig.maxFileSize / (1024 * 1024)).toFixed(2)}MB`);
  console.log(`   Supported Extensions: ${appConfig.supportedExtensions.join(', ')}`);
  console.log(`   File Watching: ${appConfig.enableFileWatching ? 'Enabled' : 'Disabled'}`);
  console.log(`   CORS Origin: ${appConfig.corsOrigin}`);
  console.log(`   Environment: ${appConfig.environment}`);
}
