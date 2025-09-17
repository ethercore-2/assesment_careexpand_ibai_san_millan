import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from '../../../../src/common/filters/http-exception.filter';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserConflictException } from '../../../../src/common/exceptions/user-conflict.exception';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockLogger: jest.Mocked<Logger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: Partial<ArgumentsHost>;

  beforeEach(async () => {
    // Create mock logger
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    // Create mock request
    mockRequest = {
      method: 'POST',
      url: '/users',
      originalUrl: '/users',
      headers: {
        'user-agent': 'test-agent',
        'content-type': 'application/json',
      },
      ip: '127.0.0.1',
      body: { name: 'Test User', email: 'test@example.com' },
      query: {},
      params: {},
    };

    // Create mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      statusCode: 200,
    };

    // Create mock arguments host
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    };

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpExceptionFilter,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Filter Initialization', () => {
    it('should be defined', () => {
      expect(filter).toBeDefined();
    });

    it('should have logger instance', () => {
      expect(filter['logger']).toBeDefined();
    });

    it('should implement ExceptionFilter interface', () => {
      expect(typeof filter.catch).toBe('function');
    });
  });

  describe('catch method - HttpException Handling', () => {
    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: 'Bad Request',
        error: 'HttpException',
      });
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Validation failed', error: 'Bad Request' },
        HttpStatus.BAD_REQUEST
      );
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: 'Validation failed',
        error: 'Bad Request',
      });
    });

    it('should handle HttpException with array message', () => {
      const exception = new HttpException(
        ['Name is required', 'Email is required'],
        HttpStatus.BAD_REQUEST
      );
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: ['Name is required', 'Email is required'],
        error: 'HttpException',
      });
    });

    it('should handle different HTTP status codes', () => {
      const statusCodes = [
        { status: HttpStatus.BAD_REQUEST, message: 'Bad Request' },
        { status: HttpStatus.UNAUTHORIZED, message: 'Unauthorized' },
        { status: HttpStatus.FORBIDDEN, message: 'Forbidden' },
        { status: HttpStatus.NOT_FOUND, message: 'Not Found' },
        { status: HttpStatus.CONFLICT, message: 'Conflict' },
        { status: HttpStatus.UNPROCESSABLE_ENTITY, message: 'Unprocessable Entity' },
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal Server Error' },
      ];

      statusCodes.forEach(({ status, message }) => {
        const exception = new HttpException(message, status);
        
        filter.catch(exception, mockArgumentsHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(status);
        expect(mockResponse.json).toHaveBeenCalledWith({
          statusCode: status,
          timestamp: expect.any(String),
          path: mockRequest.url,
          method: mockRequest.method,
          message,
          error: 'HttpException',
        });
      });
    });

    it('should handle custom exceptions extending HttpException', () => {
      const exception = new UserConflictException('test@example.com');
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: 'User with email test@example.com already exists',
        error: 'ConflictException',
      });
    });
  });

  describe('catch method - Non-HttpException Handling', () => {
    it('should handle generic Error', () => {
      const exception = new Error('Generic error');
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    });

    it('should handle TypeError', () => {
      const exception = new TypeError('Type error occurred');
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    });

    it('should handle ReferenceError', () => {
      const exception = new ReferenceError('Reference error occurred');
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    });

    it('should handle null exception', () => {
      filter.catch(null as any, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    });

    it('should handle undefined exception', () => {
      filter.catch(undefined as any, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    });

    it('should handle string exception', () => {
      filter.catch('String error' as any, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    });

    it('should handle object exception', () => {
      const exception = { message: 'Object error', code: 500 };
      
      filter.catch(exception as any, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: mockRequest.url,
        method: mockRequest.method,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    });
  });

  describe('catch method - Response Format', () => {
    it('should include all required fields in response', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      
      expect(responseCall).toHaveProperty('statusCode');
      expect(responseCall).toHaveProperty('timestamp');
      expect(responseCall).toHaveProperty('path');
      expect(responseCall).toHaveProperty('method');
      expect(responseCall).toHaveProperty('message');
      expect(responseCall).toHaveProperty('error');
    });

    it('should use correct timestamp format', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      const timestamp = responseCall.timestamp;
      
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should use request URL as path', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.path).toBe(mockRequest.url);
    });

    it('should use request method', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.method).toBe(mockRequest.method);
    });
  });

  describe('catch method - Logging', () => {
    it('should log error information', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });

    it('should log with correct format', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockLogger.error).toHaveBeenCalledWith(
        `${mockRequest.method} ${mockRequest.url}`,
        expect.any(String)
      );
    });

    it('should log error response as JSON', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const logCall = mockLogger.error.mock.calls[0];
      const errorResponse = JSON.parse(logCall[1]);
      
      expect(errorResponse).toHaveProperty('statusCode');
      expect(errorResponse).toHaveProperty('timestamp');
      expect(errorResponse).toHaveProperty('path');
      expect(errorResponse).toHaveProperty('method');
      expect(errorResponse).toHaveProperty('message');
      expect(errorResponse).toHaveProperty('error');
    });

    it('should log different error types', () => {
      const exceptions = [
        new HttpException('Http error', HttpStatus.BAD_REQUEST),
        new Error('Generic error'),
        new UserConflictException('test@example.com'),
      ];

      exceptions.forEach(exception => {
        filter.catch(exception, mockArgumentsHost as ArgumentsHost);
      });

      expect(mockLogger.error).toHaveBeenCalledTimes(exceptions.length);
    });
  });

  describe('catch method - Edge Cases', () => {
    it('should handle request with undefined URL', () => {
      mockRequest.url = undefined as any;
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.path).toBeUndefined();
    });

    it('should handle request with undefined method', () => {
      mockRequest.method = undefined as any;
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.method).toBeUndefined();
    });

    it('should handle request with null URL', () => {
      mockRequest.url = null as any;
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.path).toBeNull();
    });

    it('should handle request with null method', () => {
      mockRequest.method = null as any;
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.method).toBeNull();
    });

    it('should handle request with empty string URL', () => {
      mockRequest.url = '';
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.path).toBe('');
    });

    it('should handle request with empty string method', () => {
      mockRequest.method = '';
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.method).toBe('');
    });
  });

  describe('catch method - Performance', () => {
    it('should handle exceptions quickly', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      const startTime = Date.now();
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Should handle in less than 10ms
    });

    it('should handle multiple exceptions efficiently', () => {
      const exceptions = Array.from({ length: 100 }, (_, i) => 
        new HttpException(`Error ${i}`, HttpStatus.BAD_REQUEST)
      );

      const startTime = Date.now();
      exceptions.forEach(exception => {
        filter.catch(exception, mockArgumentsHost as ArgumentsHost);
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should handle 100 exceptions in less than 100ms
    });
  });

  describe('catch method - Integration Scenarios', () => {
    it('should work with different request types', () => {
      const requests = [
        { method: 'GET', url: '/users' },
        { method: 'POST', url: '/users' },
        { method: 'PUT', url: '/users/1' },
        { method: 'DELETE', url: '/users/1' },
      ];

      requests.forEach((req, index) => {
        mockRequest.method = req.method;
        mockRequest.url = req.url;
        
        const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
        filter.catch(exception, mockArgumentsHost as ArgumentsHost);
        
        expect(mockResponse.status).toHaveBeenCalledTimes(index + 1);
        expect(mockResponse.json).toHaveBeenCalledTimes(index + 1);
      });
    });

    it('should work with different response objects', () => {
      const responses = [
        { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() },
        { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() },
        { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() },
      ];

      responses.forEach((res, index) => {
        mockArgumentsHost = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue(mockRequest),
            getResponse: jest.fn().mockReturnValue(res),
          }),
        };
        
        const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
        filter.catch(exception, mockArgumentsHost as ArgumentsHost);
        
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('catch method - Error Handling', () => {
    it('should handle logger error gracefully', () => {
      mockLogger.error.mockImplementationOnce(() => {
        throw new Error('Logger error');
      });

      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      expect(() => {
        filter.catch(exception, mockArgumentsHost as ArgumentsHost);
      }).toThrow('Logger error');
    });

    it('should handle response.status error gracefully', () => {
      mockResponse.status.mockImplementationOnce(() => {
        throw new Error('Response status error');
      });

      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      expect(() => {
        filter.catch(exception, mockArgumentsHost as ArgumentsHost);
      }).toThrow('Response status error');
    });

    it('should handle response.json error gracefully', () => {
      mockResponse.json.mockImplementationOnce(() => {
        throw new Error('Response json error');
      });

      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      
      expect(() => {
        filter.catch(exception, mockArgumentsHost as ArgumentsHost);
      }).toThrow('Response json error');
    });
  });
});
