/**
 * Logging middleware
 * Logs all incoming HTTP requests with timestamp, method, and URL
 */
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  /**
   * Middleware function that logs request details
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Next function in the middleware chain
   */
  use(req: Request, res: Response, next: NextFunction) {
    // Extract request method and URL
    const { method, originalUrl } = req;
    
    // Get current timestamp in ISO format
    const timestamp = new Date().toISOString();
    
    // Log the request with timestamp, method, and URL
    this.logger.log(`[${timestamp}] ${method} ${originalUrl}`);
    
    // Continue to the next middleware or route handler
    next();
  }
}
