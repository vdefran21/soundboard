"use strict";
/**
 * Express middleware for error handling, logging, and request processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.requestLogger = requestLogger;
exports.corsHandler = corsHandler;
exports.validateJsonPayload = validateJsonPayload;
exports.securityHeaders = securityHeaders;
exports.validateFileSize = validateFileSize;
const utils_1 = require("../utils");
const config_1 = require("../utils/config");
/**
 * Global error handler middleware
 * @param error - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
function errorHandler(error, req, res, _next) {
    console.error('❌ Error occurred:', {
        method: req.method,
        url: req.url,
        error: (0, utils_1.getErrorMessage)(error),
        stack: (0, utils_1.isError)(error) ? error.stack : undefined,
    });
    const errorResponse = {
        success: false,
        message: (0, utils_1.isError)(error) ? error.message : 'An unexpected error occurred',
        timestamp: new Date(),
    };
    // Add error code if available
    if ((0, utils_1.isError)(error) && 'code' in error) {
        errorResponse.code = String(error.code);
    }
    // In development, include error details
    if (config_1.appConfig.environment === 'development' && (0, utils_1.isError)(error)) {
        errorResponse.details = {
            stack: error.stack,
            name: error.name,
        };
    }
    // Determine status code
    let statusCode = 500;
    if ((0, utils_1.isError)(error) && 'statusCode' in error && typeof error.statusCode === 'number') {
        statusCode = error.statusCode;
    }
    res.status(statusCode).json(errorResponse);
}
/**
 * 404 Not Found handler
 * @param req - Express request object
 * @param res - Express response object
 */
function notFoundHandler(req, res) {
    const errorResponse = {
        success: false,
        message: `Route ${req.originalUrl} not found`,
        code: 'NOT_FOUND',
        timestamp: new Date(),
    };
    res.status(404).json(errorResponse);
}
/**
 * Request logging middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
        console.log(`${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    next();
}
/**
 * CORS configuration middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
function corsHandler(req, res, next) {
    const origin = req.headers.origin;
    // Set CORS headers
    if (config_1.appConfig.corsOrigin === '*' || origin === config_1.appConfig.corsOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
}
/**
 * Request validation middleware for JSON payloads
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
function validateJsonPayload(req, _res, next) {
    if (req.headers['content-type']?.includes('application/json') && req.method !== 'GET') {
        if (!req.body || typeof req.body !== 'object') {
            const error = new Error('Invalid JSON payload');
            error.statusCode = 400;
            return next(error);
        }
    }
    next();
}
/**
 * Security headers middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
function securityHeaders(_req, res, next) {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Content Security Policy for the soundboard application
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "media-src 'self'",
        "connect-src 'self'",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'"
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    next();
}
/**
 * File size validation middleware for uploads
 * @param maxSize - Maximum file size in bytes
 */
function validateFileSize(maxSize) {
    return (req, _res, next) => {
        const contentLength = req.headers['content-length'];
        if (contentLength && parseInt(contentLength, 10) > maxSize) {
            const error = new Error(`File size exceeds maximum limit of ${maxSize} bytes`);
            error.statusCode = 413;
            return next(error);
        }
        next();
    };
}
//# sourceMappingURL=index.js.map