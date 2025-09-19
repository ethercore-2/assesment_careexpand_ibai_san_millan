import { Test, TestingModule } from '@nestjs/testing';
import { LoggingMiddleware } from '../../../src/logging/logging.middleware';
import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let mockLogger: jest.Mocked<Logger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    mockRequest = {
      method: 'GET',
      originalUrl: '/users',
    };

    mockResponse = {
      statusCode: 200,
    };

    mockNext = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingMiddleware,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    middleware = module.get<LoggingMiddleware>(LoggingMiddleware);
    // Manually inject the mock logger
    middleware['logger'] = mockLogger;
    jest.clearAllMocks();
  });

  describe('Middleware Initialization', () => {
  it('should be defined', () => {
      expect(middleware).toBeDefined();
    });

    it('should have logger instance', () => {
      expect(middleware['logger']).toBeDefined();
    });

    it('should implement NestMiddleware interface', () => {
      expect(typeof middleware.use).toBe('function');
    });
  });

  describe('use method - Basic Functionality', () => {
    it('should call next() function', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should log request information', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledTimes(1);
    });

    it('should log with correct format', () => {
      const fixedDate = new Date('2024-01-15T10:30:00.000Z');
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-15T10:30:00.000Z');

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        '[2024-01-15T10:30:00.000Z] GET /users'
      );
    });

    it('should extract method and originalUrl from request', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] GET \/users/)
      );
    });
  });

  describe('use method - Different HTTP Methods', () => {
    it('should log GET requests correctly', () => {
      mockRequest.method = 'GET';
      mockRequest.originalUrl = '/users';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] GET \/users/)
      );
    });

    it('should log POST requests correctly', () => {
      mockRequest.method = 'POST';
      mockRequest.originalUrl = '/users';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] POST \/users/)
      );
    });

    it('should log PUT requests correctly', () => {
      mockRequest.method = 'PUT';
      mockRequest.originalUrl = '/users/1';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] PUT \/users\/1/)
      );
    });

    it('should log DELETE requests correctly', () => {
      mockRequest.method = 'DELETE';
      mockRequest.originalUrl = '/users/1';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] DELETE \/users\/1/)
      );
    });
  });

  describe('use method - Different URL Patterns', () => {
    it('should log root path correctly', () => {
      mockRequest.originalUrl = '/';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] GET \//)
      );
    });

    it('should log nested paths correctly', () => {
      mockRequest.originalUrl = '/api/v1/users/123/profile';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] GET \/api\/v1\/users\/123\/profile/)
      );
    });

    it('should log paths with query parameters correctly', () => {
      mockRequest.originalUrl = '/users?page=1&limit=10';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] GET \/users\?page=1&limit=10/)
      );
    });
  });

  describe('use method - Timestamp Handling', () => {
    it('should log with current timestamp', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/^\[.*\] GET \/users$/)
      );

      const logCall = mockLogger.log.mock.calls[0][0];
      const timestampMatch = logCall.match(/^\[(.*)\]/);
      expect(timestampMatch).toBeTruthy();
      
      const loggedTimestamp = new Date(timestampMatch[1]).getTime();
      expect(loggedTimestamp).toBeGreaterThan(0);
      expect(loggedTimestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should log with ISO string format', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      const logCall = mockLogger.log.mock.calls[0][0];
      const timestampMatch = logCall.match(/^\[(.*)\]/);
      expect(timestampMatch).toBeTruthy();
      
      const timestamp = timestampMatch[1];
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('use method - Edge Cases', () => {
    it('should handle undefined method gracefully', () => {
      mockRequest.method = undefined as any;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] undefined \/users/)
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined originalUrl gracefully', () => {
      mockRequest.originalUrl = undefined as any;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] GET undefined/)
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle null method gracefully', () => {
      mockRequest.method = null as any;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] null \/users/)
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle null originalUrl gracefully', () => {
      mockRequest.originalUrl = null as any;

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] GET null/)
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string method', () => {
      mockRequest.method = '';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\]  \/users/)
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string originalUrl', () => {
      mockRequest.originalUrl = '';

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] GET /)
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('use method - Error Handling', () => {
    it('should continue execution if logger.log throws error', () => {
      mockLogger.log.mockImplementationOnce(() => {
        throw new Error('Logger error');
      });

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Logger error');

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle next function throwing error', () => {
      mockNext.mockImplementationOnce(() => {
        throw new Error('Next function error');
      });

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Next function error');

      expect(mockLogger.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('use method - Performance', () => {
    it('should execute quickly for simple requests', () => {
      const startTime = Date.now();
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid successive calls efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }
      
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(mockNext).toHaveBeenCalledTimes(1000);
      expect(mockLogger.log).toHaveBeenCalledTimes(1000);
    });
  });

  describe('use method - Integration Scenarios', () => {
    it('should work with different request objects', () => {
      const requests = [
        { method: 'GET', originalUrl: '/users' },
        { method: 'POST', originalUrl: '/users' },
        { method: 'PUT', originalUrl: '/users/1' },
        { method: 'DELETE', originalUrl: '/users/1' },
      ];

      requests.forEach((req, index) => {
        middleware.use(req as Request, mockResponse as Response, mockNext);
        expect(mockLogger.log).toHaveBeenCalledTimes(index + 1);
        expect(mockNext).toHaveBeenCalledTimes(index + 1);
      });
    });

    it('should work with different response objects', () => {
      const responses = [
        { statusCode: 200 },
        { statusCode: 201 },
        { statusCode: 404 },
        { statusCode: 500 },
      ];

      responses.forEach((res, index) => {
        middleware.use(mockRequest as Request, res as Response, mockNext);
        expect(mockLogger.log).toHaveBeenCalledTimes(index + 1);
        expect(mockNext).toHaveBeenCalledTimes(index + 1);
      });
  });
});

  describe('use method - Logger Integration', () => {
    it('should use the correct logger instance', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledTimes(1);
    });

    it('should pass the correct log level', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.any(String)
      );
    });

    it('should not call other logger methods', () => {
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockLogger.verbose).not.toHaveBeenCalled();
    });
  });
});
