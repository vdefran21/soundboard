/**
 * Express middleware for error handling, logging, and request processing
 */
import { NextFunction, Request, Response } from 'express';
/**
 * Global error handler middleware
 * @param error - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export declare function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void;
/**
 * 404 Not Found handler
 * @param req - Express request object
 * @param res - Express response object
 */
export declare function notFoundHandler(req: Request, res: Response): void;
/**
 * Request logging middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export declare function requestLogger(req: Request, res: Response, next: NextFunction): void;
/**
 * CORS configuration middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export declare function corsHandler(req: Request, res: Response, next: NextFunction): void;
/**
 * Request validation middleware for JSON payloads
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export declare function validateJsonPayload(req: Request, _res: Response, next: NextFunction): void;
/**
 * Security headers middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export declare function securityHeaders(_req: Request, res: Response, next: NextFunction): void;
/**
 * File size validation middleware for uploads
 * @param maxSize - Maximum file size in bytes
 */
export declare function validateFileSize(maxSize: number): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=index.d.ts.map