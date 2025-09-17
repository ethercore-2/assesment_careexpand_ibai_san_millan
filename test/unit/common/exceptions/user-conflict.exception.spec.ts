import { UserConflictException } from '../../../../src/common/exceptions/user-conflict.exception';
import { ConflictException } from '@nestjs/common';

describe('UserConflictException', () => {
  describe('Exception Initialization', () => {
    it('should be defined', () => {
      expect(UserConflictException).toBeDefined();
    });

    it('should extend ConflictException', () => {
      const exception = new UserConflictException('test@example.com');
      expect(exception).toBeInstanceOf(ConflictException);
    });

    it('should be an instance of Error', () => {
      const exception = new UserConflictException('test@example.com');
      expect(exception).toBeInstanceOf(Error);
    });
  });

  describe('Constructor', () => {
    it('should create exception with valid email', () => {
      const email = 'test@example.com';
      const exception = new UserConflictException(email);

      expect(exception).toBeDefined();
      expect(exception.message).toBe(`User with email ${email} already exists`);
    });

    it('should create exception with different email formats', () => {
      const emails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.org',
        'user123@subdomain.example.com',
        'user@example-domain.com',
      ];

      emails.forEach(email => {
        const exception = new UserConflictException(email);
        expect(exception.message).toBe(`User with email ${email} already exists`);
      });
    });

    it('should handle special characters in email', () => {
      const specialEmails = [
        'user+test@example.com',
        'user.test@example.com',
        'user_test@example.com',
        'user-test@example.com',
        'user123@example.com',
      ];

      specialEmails.forEach(email => {
        const exception = new UserConflictException(email);
        expect(exception.message).toBe(`User with email ${email} already exists`);
      });
    });

    it('should handle international email domains', () => {
      const internationalEmails = [
        'user@example.co.uk',
        'user@example.fr',
        'user@example.de',
        'user@example.jp',
        'user@example.com.br',
      ];

      internationalEmails.forEach(email => {
        const exception = new UserConflictException(email);
        expect(exception.message).toBe(`User with email ${email} already exists`);
      });
    });
  });

  describe('Exception Properties', () => {
    it('should have correct status code', () => {
      const exception = new UserConflictException('test@example.com');
      expect(exception.getStatus()).toBe(409);
    });

    it('should have correct name', () => {
      const exception = new UserConflictException('test@example.com');
      expect(exception.name).toBe('ConflictException');
    });

    it('should have correct message format', () => {
      const email = 'test@example.com';
      const exception = new UserConflictException(email);
      
      expect(exception.message).toContain('User with email');
      expect(exception.message).toContain(email);
      expect(exception.message).toContain('already exists');
    });

    it('should have stack trace', () => {
      const exception = new UserConflictException('test@example.com');
      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe('string');
      expect(exception.stack).toContain('UserConflictException');
    });
  });

  describe('Exception Response', () => {
    it('should return correct response object', () => {
      const email = 'test@example.com';
      const exception = new UserConflictException(email);
      const response = exception.getResponse();

      expect(response).toBeDefined();
      expect(response).toBe(`User with email ${email} already exists`);
    });

    it('should return string response', () => {
      const exception = new UserConflictException('test@example.com');
      const response = exception.getResponse();

      expect(typeof response).toBe('string');
    });
  });

  describe('Exception Inheritance', () => {
    it('should inherit from ConflictException', () => {
      const exception = new UserConflictException('test@example.com');
      
      expect(exception instanceof ConflictException).toBe(true);
      expect(exception instanceof Error).toBe(true);
    });

    it('should have ConflictException methods', () => {
      const exception = new UserConflictException('test@example.com');
      
      expect(typeof exception.getStatus).toBe('function');
      expect(typeof exception.getResponse).toBe('function');
      expect(typeof exception.toString).toBe('function');
    });

    it('should maintain ConflictException behavior', () => {
      const exception = new UserConflictException('test@example.com');
      
      expect(exception.getStatus()).toBe(409);
      expect(exception.getResponse()).toBe('User with email test@example.com already exists');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string email', () => {
      const exception = new UserConflictException('');
      expect(exception.message).toBe('User with email  already exists');
    });

    it('should handle null email', () => {
      const exception = new UserConflictException(null as any);
      expect(exception.message).toBe('User with email null already exists');
    });

    it('should handle undefined email', () => {
      const exception = new UserConflictException(undefined as any);
      expect(exception.message).toBe('User with email undefined already exists');
    });

    it('should handle very long email', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const exception = new UserConflictException(longEmail);
      expect(exception.message).toBe(`User with email ${longEmail} already exists`);
    });

    it('should handle email with special characters', () => {
      const specialEmail = 'user+test@example-domain.co.uk';
      const exception = new UserConflictException(specialEmail);
      expect(exception.message).toBe(`User with email ${specialEmail} already exists`);
    });

    it('should handle email with spaces', () => {
      const emailWithSpaces = 'user @example.com';
      const exception = new UserConflictException(emailWithSpaces);
      expect(exception.message).toBe(`User with email ${emailWithSpaces} already exists`);
    });

    it('should handle email with unicode characters', () => {
      const unicodeEmail = 'user@éxample.com';
      const exception = new UserConflictException(unicodeEmail);
      expect(exception.message).toBe(`User with email ${unicodeEmail} already exists`);
    });
  });

  describe('Exception Serialization', () => {
    it('should be serializable to JSON', () => {
      const exception = new UserConflictException('test@example.com');
      const json = JSON.stringify(exception);
      
      expect(json).toBeDefined();
      expect(typeof json).toBe('string');
    });

    it('should contain message in JSON serialization', () => {
      const email = 'test@example.com';
      const exception = new UserConflictException(email);
      const json = JSON.stringify(exception);
      
      expect(json).toContain('User with email');
      expect(json).toContain(email);
      expect(json).toContain('already exists');
    });

    it('should be convertible to string', () => {
      const exception = new UserConflictException('test@example.com');
      const string = exception.toString();
      
      expect(string).toBeDefined();
      expect(typeof string).toBe('string');
      expect(string).toContain('UserConflictException');
    });
  });

  describe('Exception Comparison', () => {
    it('should be equal to another exception with same email', () => {
      const email = 'test@example.com';
      const exception1 = new UserConflictException(email);
      const exception2 = new UserConflictException(email);
      
      expect(exception1.message).toBe(exception2.message);
      expect(exception1.getStatus()).toBe(exception2.getStatus());
    });

    it('should be different from exception with different email', () => {
      const exception1 = new UserConflictException('user1@example.com');
      const exception2 = new UserConflictException('user2@example.com');
      
      expect(exception1.message).not.toBe(exception2.message);
    });

    it('should be different from generic ConflictException', () => {
      const userConflict = new UserConflictException('test@example.com');
      const genericConflict = new ConflictException('Generic conflict');
      
      expect(userConflict.message).not.toBe(genericConflict.message);
    });
  });

  describe('Exception Error Handling', () => {
    it('should be throwable', () => {
      expect(() => {
        throw new UserConflictException('test@example.com');
      }).toThrow(UserConflictException);
    });

    it('should be catchable as ConflictException', () => {
      expect(() => {
        throw new UserConflictException('test@example.com');
      }).toThrow(ConflictException);
    });

    it('should be catchable as Error', () => {
      expect(() => {
        throw new UserConflictException('test@example.com');
      }).toThrow(Error);
    });

    it('should preserve message when thrown and caught', () => {
      const email = 'test@example.com';
      let caughtException: any;
      
      try {
        throw new UserConflictException(email);
      } catch (error) {
        caughtException = error;
      }
      
      expect(caughtException).toBeInstanceOf(UserConflictException);
      expect(caughtException.message).toBe(`User with email ${email} already exists`);
    });
  });

  describe('Exception Performance', () => {
    it('should create exception quickly', () => {
      const startTime = Date.now();
      const exception = new UserConflictException('test@example.com');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Should create in less than 10ms
      expect(exception).toBeDefined();
    });

    it('should handle multiple exception creations efficiently', () => {
      const startTime = Date.now();
      const exceptions = [];
      
      for (let i = 0; i < 1000; i++) {
        exceptions.push(new UserConflictException(`user${i}@example.com`));
      }
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should create 1000 exceptions in less than 100ms
      expect(exceptions).toHaveLength(1000);
    });
  });

  describe('Exception Integration', () => {
    it('should work with try-catch blocks', () => {
      const email = 'test@example.com';
      let exceptionCaught = false;
      
      try {
        throw new UserConflictException(email);
      } catch (error) {
        exceptionCaught = true;
        expect(error).toBeInstanceOf(UserConflictException);
        expect(error.message).toBe(`User with email ${email} already exists`);
      }
      
      expect(exceptionCaught).toBe(true);
    });

    it('should work with async/await error handling', async () => {
      const email = 'test@example.com';
      
      const asyncFunction = async () => {
        throw new UserConflictException(email);
      };
      
      await expect(asyncFunction()).rejects.toThrow(UserConflictException);
      await expect(asyncFunction()).rejects.toThrow(`User with email ${email} already exists`);
    });

    it('should work with Promise rejection handling', () => {
      const email = 'test@example.com';
      
      const promiseFunction = () => {
        return Promise.reject(new UserConflictException(email));
      };
      
      return expect(promiseFunction()).rejects.toThrow(UserConflictException);
    });
  });
});
