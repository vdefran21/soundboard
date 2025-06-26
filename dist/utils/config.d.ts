/**
 * Configuration management for the Soundboard application
 */
import { AppConfig } from '../models';
/**
 * Application configuration object
 */
export declare const appConfig: AppConfig;
/**
 * Validates the configuration
 * @returns True if configuration is valid, throws error otherwise
 */
export declare function validateConfig(): boolean;
/**
 * Logs the current configuration (excluding sensitive data)
 */
export declare function logConfig(): void;
//# sourceMappingURL=config.d.ts.map