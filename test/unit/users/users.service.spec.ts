import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/users/users.service';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { UserResponseDto } from '../../../src/users/dto/user-response.dto';
import { UserConflictException } from '../../../src/common/exceptions/user-conflict.exception';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset service state between tests
    (service as any).users.clear();
    (service as any).nextId = 1;
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with empty users map', () => {
      expect((service as any).users).toBeDefined();
      expect((service as any).users.size).toBe(0);
    });

    it('should initialize with nextId starting at 1', () => {
      expect((service as any).nextId).toBe(1);
    });
  });

  describe('createUser', () => {
    const validCreateUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    describe('Success Cases', () => {
      it('should create a user successfully with valid data', async () => {
        const result = await service.createUser(validCreateUserDto);

        expect(result).toBeDefined();
        expect(result).toMatchObject({
          name: validCreateUserDto.name,
          email: validCreateUserDto.email,
        });
        expect(result.id).toBe(1);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      });

      it('should assign unique incremental IDs', async () => {
        const user1 = await service.createUser(validCreateUserDto);
        const user2 = await service.createUser({
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
        });

        expect(user1.id).toBe(1);
        expect(user2.id).toBe(2);
      });

      it('should store user in internal map', async () => {
        await service.createUser(validCreateUserDto);
        
        const users = (service as any).users;
        expect(users.size).toBe(1);
        expect(users.get(1)).toBeDefined();
      });

      it('should handle special characters in name', async () => {
        const specialNameDto: CreateUserDto = {
          name: 'José María O\'Connor-Smith',
          email: 'jose.maria@example.com',
        };

        const result = await service.createUser(specialNameDto);
        expect(result.name).toBe(specialNameDto.name);
      });

      it('should handle international email domains', async () => {
        const internationalEmailDto: CreateUserDto = {
          name: 'Test User',
          email: 'test@example.co.uk',
        };

        const result = await service.createUser(internationalEmailDto);
        expect(result.email).toBe(internationalEmailDto.email);
      });
    });

    describe('Error Cases', () => {
      it('should throw UserConflictException when email already exists', async () => {
        await service.createUser(validCreateUserDto);

        await expect(service.createUser(validCreateUserDto)).rejects.toThrow(
          UserConflictException,
        );
        await expect(service.createUser(validCreateUserDto)).rejects.toThrow(
          'User with email john.doe@example.com already exists',
        );
      });

      it('should throw UserConflictException with case-insensitive email comparison', async () => {
        await service.createUser(validCreateUserDto);

        const duplicateEmailDto: CreateUserDto = {
          name: 'Different Name',
          email: 'JOHN.DOE@EXAMPLE.COM',
        };

        await expect(service.createUser(duplicateEmailDto)).rejects.toThrow(
          UserConflictException,
        );
      });

      it('should not create user when conflict occurs', async () => {
        await service.createUser(validCreateUserDto);
        const initialUserCount = (service as any).users.size;

        try {
          await service.createUser(validCreateUserDto);
        } catch (error) {
          // Expected to throw
        }

        expect((service as any).users.size).toBe(initialUserCount);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string name', async () => {
        const emptyNameDto: CreateUserDto = {
          name: '',
          email: 'test@example.com',
        };

        // This should be handled by validation, but testing service behavior
        const result = await service.createUser(emptyNameDto);
        expect(result.name).toBe('');
      });

      it('should handle very long names', async () => {
        const longNameDto: CreateUserDto = {
          name: 'A'.repeat(1000),
          email: 'longname@example.com',
        };

        const result = await service.createUser(longNameDto);
        expect(result.name).toBe(longNameDto.name);
      });

      it('should handle very long emails', async () => {
        const longEmailDto: CreateUserDto = {
          name: 'Test User',
          email: 'a'.repeat(100) + '@example.com',
        };

        const result = await service.createUser(longEmailDto);
        expect(result.email).toBe(longEmailDto.email);
      });
    });
  });

  describe('getUserList', () => {
    describe('Success Cases', () => {
      it('should return empty array when no users exist', async () => {
        const result = await service.getUserList();
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
      });

      it('should return all users when users exist', async () => {
        const user1 = await service.createUser({
          name: 'User One',
          email: 'user1@example.com',
        });
        const user2 = await service.createUser({
          name: 'User Two',
          email: 'user2@example.com',
        });

        const result = await service.getUserList();

        expect(result).toHaveLength(2);
        expect(result).toContainEqual(user1);
        expect(result).toContainEqual(user2);
      });

      it('should return users in creation order', async () => {
        const user1 = await service.createUser({
          name: 'First User',
          email: 'first@example.com',
        });
        const user2 = await service.createUser({
          name: 'Second User',
          email: 'second@example.com',
        });

        const result = await service.getUserList();

        expect(result[0]).toEqual(user1);
        expect(result[1]).toEqual(user2);
      });

      it('should return a copy of users array, not reference', async () => {
        await service.createUser({
          name: 'Test User',
          email: 'test@example.com',
        });

        const result1 = await service.getUserList();
        const result2 = await service.getUserList();

        expect(result1).not.toBe(result2); // Different array instances
        expect(result1).toEqual(result2); // Same content
      });
    });

    describe('Performance Cases', () => {
      it('should handle large number of users efficiently', async () => {
        const userCount = 1000;
        
        // Create many users
        for (let i = 0; i < userCount; i++) {
          await service.createUser({
            name: `User ${i}`,
            email: `user${i}@example.com`,
          });
        }

        const startTime = Date.now();
        const result = await service.getUserList();
        const endTime = Date.now();

        expect(result).toHaveLength(userCount);
        expect(endTime - startTime).toBeLessThan(100); // Should be fast
      });
    });
  });

  describe('getExternalUsers', () => {
    describe('Success Cases', () => {
      it('should fetch external users successfully', async () => {
        const mockExternalUsers = [
          { id: 1, email: 'external1@reqres.in', first_name: 'External', last_name: 'User1' },
          { id: 2, email: 'external2@reqres.in', first_name: 'External', last_name: 'User2' },
        ];

        mockedAxios.get.mockResolvedValueOnce({
          data: { data: mockExternalUsers },
        });

        const result = await service.getExternalUsers();

        expect(result).toEqual(mockExternalUsers);
        expect(mockedAxios.get).toHaveBeenCalledWith('https://reqres.in/api/users');
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });

      it('should handle empty external users response', async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: { data: [] },
        });

        const result = await service.getExternalUsers();

        expect(result).toEqual([]);
      });

      it('should handle external API with different response structure', async () => {
        const mockResponse = {
          data: {
            users: [{ id: 1, email: 'test@reqres.in' }],
          },
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await service.getExternalUsers();

        expect(result).toEqual(mockResponse.data.users);
      });
    });

    describe('Error Cases', () => {
      it('should throw error when external API fails', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(service.getExternalUsers()).rejects.toThrow(
          'Failed to fetch external users',
        );
      });

      it('should throw error when external API returns invalid response', async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: null,
        });

        await expect(service.getExternalUsers()).rejects.toThrow(
          'Failed to fetch external users',
        );
      });

      it('should throw error when external API times out', async () => {
        mockedAxios.get.mockRejectedValueOnce({
          code: 'ECONNABORTED',
          message: 'timeout of 5000ms exceeded',
        });

        await expect(service.getExternalUsers()).rejects.toThrow(
          'Failed to fetch external users',
        );
      });

      it('should throw error when external API returns 404', async () => {
        mockedAxios.get.mockRejectedValueOnce({
          response: { status: 404 },
          message: 'Not Found',
        });

        await expect(service.getExternalUsers()).rejects.toThrow(
          'Failed to fetch external users',
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle external API returning malformed data', async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: 'invalid json',
        });

        await expect(service.getExternalUsers()).rejects.toThrow(
          'Failed to fetch external users',
        );
      });

      it('should handle external API returning undefined data', async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: undefined,
        });

        await expect(service.getExternalUsers()).rejects.toThrow(
          'Failed to fetch external users',
        );
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle mixed operations correctly', async () => {
      // Create users
      const user1 = await service.createUser({
        name: 'User One',
        email: 'user1@example.com',
      });

      // Get user list
      let users = await service.getUserList();
      expect(users).toHaveLength(1);

      // Create another user
      const user2 = await service.createUser({
        name: 'User Two',
        email: 'user2@example.com',
      });

      // Get updated user list
      users = await service.getUserList();
      expect(users).toHaveLength(2);
      expect(users).toContainEqual(user1);
      expect(users).toContainEqual(user2);

      // Try to create duplicate (should fail)
      await expect(service.createUser({
        name: 'Duplicate User',
        email: 'user1@example.com',
      })).rejects.toThrow(UserConflictException);

      // User list should remain unchanged
      users = await service.getUserList();
      expect(users).toHaveLength(2);
    });

    it('should maintain data consistency across operations', async () => {
      const initialUsers = await service.getUserList();
      expect(initialUsers).toHaveLength(0);

      const user = await service.createUser({
        name: 'Test User',
        email: 'test@example.com',
      });

      const usersAfterCreate = await service.getUserList();
      expect(usersAfterCreate).toHaveLength(1);
      expect(usersAfterCreate[0]).toEqual(user);

      // Verify user data integrity
      expect(user.id).toBe(1);
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });
});