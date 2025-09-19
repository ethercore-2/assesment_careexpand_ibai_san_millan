/**
 * Global HTTP exception filter
 * Centralizes error handling and provides consistent error responses
 * Catches all exceptions and formats them into standardized JSON responses
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Handles all exceptions thrown in the application
   * @param exception - The exception that was thrown
   * @param host - Arguments host containing request/response context
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    // Get HTTP context from the host
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Initialize error response variables
    let status: number;
    let message: string | string[];
    let error: string;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      // Known HTTP exceptions (validation errors, business logic errors, etc.)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // Extract message and error type from exception response
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
      }
    } else {
      // Unknown exceptions (server errors, database errors, etc.)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    // Create standardized error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    // Log the error for debugging and monitoring
    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
    );

    // Send error response to client
    response.status(status).json(errorResponse);
  }
}
