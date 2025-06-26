/**
 * Express middleware for error handling, logging, and request processing
 */

import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../models';
import { getErrorMessage, isError } from '../utils';
import { appConfig } from '../utils/config';

/**
 * Global error handler middleware
 * @param error - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ Error occurred:', {
    method: req.method,
    url: req.url,
    error: getErrorMessage(error),
    stack: isError(error) ? error.stack : undefined,
  });

  const errorResponse: ErrorResponse = {
    success: false,
    message: isError(error) ? error.message : 'An unexpected error occurred',
    timestamp: new Date(),
  };

  // Add error code if available
  if (isError(error) && 'code' in error) {
    errorResponse.code = String(error.code);
  }

  // In development, include error details
  if (appConfig.environment === 'development' && isError(error)) {
    errorResponse.details = {
      stack: error.stack,
      name: error.name,
    };
  }

  // Determine status code
  let statusCode = 500;
  if (isError(error) && 'statusCode' in error && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 * @param req - Express request object
 * @param res - Express response object
 */
export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ErrorResponse = {
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
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    
    console.log(
      `${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}

/**
 * CORS configuration middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function corsHandler(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  
  // Set CORS headers
  if (appConfig.corsOrigin === '*' || origin === appConfig.corsOrigin) {
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
export function validateJsonPayload(req: Request, _res: Response, next: NextFunction): void {
  if (req.headers['content-type']?.includes('application/json') && req.method !== 'GET') {
    if (!req.body || typeof req.body !== 'object') {
      const error = new Error('Invalid JSON payload');
      (error as any).statusCode = 400;
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
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
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
export function validateFileSize(maxSize: number) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      const error = new Error(`File size exceeds maximum limit of ${maxSize} bytes`);
      (error as any).statusCode = 413;
      return next(error);
    }
    
    next();
  };
}
