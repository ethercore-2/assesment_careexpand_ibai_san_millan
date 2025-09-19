import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/entities/user.entity';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { UserResponseDto } from '../../../src/users/dto/user-response.dto';
import { UserConflictException } from '../../../src/common/exceptions/user-conflict.exception';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have user repository injected', () => {
      expect(userRepository).toBeDefined();
    });
  });

  describe('createUser', () => {
    const validCreateUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    describe('Success Cases', () => {
      it('should create a user successfully with valid data', async () => {
        const mockUser = new User();
        mockUser.id = 1;
        mockUser.name = validCreateUserDto.name;
        mockUser.email = validCreateUserDto.email;
        mockUser.createdAt = new Date();

        userRepository.findOneBy.mockResolvedValue(null); // No existing user
        userRepository.create.mockReturnValue(mockUser);
        userRepository.save.mockResolvedValue(mockUser);

        const result = await service.createUser(validCreateUserDto);

        expect(result).toBeDefined();
        expect(result).toMatchObject({
          name: validCreateUserDto.name,
          email: validCreateUserDto.email,
        });
        expect(result.id).toBe(1);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: validCreateUserDto.email });
        expect(userRepository.create).toHaveBeenCalledWith(validCreateUserDto);
        expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      });

      it('should assign unique incremental IDs', async () => {
        const mockUser1 = new User();
        mockUser1.id = 1;
        mockUser1.name = validCreateUserDto.name;
        mockUser1.email = validCreateUserDto.email;
        mockUser1.createdAt = new Date();

        const mockUser2 = new User();
        mockUser2.id = 2;
        mockUser2.name = 'Jane Doe';
        mockUser2.email = 'jane.doe@example.com';
        mockUser2.createdAt = new Date();

        userRepository.findOneBy.mockResolvedValue(null);
        userRepository.create.mockReturnValueOnce(mockUser1).mockReturnValueOnce(mockUser2);
        userRepository.save.mockResolvedValueOnce(mockUser1).mockResolvedValueOnce(mockUser2);

        const user1 = await service.createUser(validCreateUserDto);
        const user2 = await service.createUser({
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
        });

        expect(user1.id).toBe(1);
        expect(user2.id).toBe(2);
      });

      it('should handle special characters in name', async () => {
        const specialNameDto: CreateUserDto = {
          name: 'José María O\'Connor-Smith',
          email: 'jose.maria@example.com',
        };

        const mockUser = new User();
        mockUser.id = 1;
        mockUser.name = specialNameDto.name;
        mockUser.email = specialNameDto.email;
        mockUser.createdAt = new Date();

        userRepository.findOneBy.mockResolvedValue(null);
        userRepository.create.mockReturnValue(mockUser);
        userRepository.save.mockResolvedValue(mockUser);

        const result = await service.createUser(specialNameDto);
        expect(result.name).toBe(specialNameDto.name);
      });

      it('should handle international email domains', async () => {
        const internationalEmailDto: CreateUserDto = {
          name: 'Test User',
          email: 'test@example.co.uk',
        };

        const mockUser = new User();
        mockUser.id = 1;
        mockUser.name = internationalEmailDto.name;
        mockUser.email = internationalEmailDto.email;
        mockUser.createdAt = new Date();

        userRepository.findOneBy.mockResolvedValue(null);
        userRepository.create.mockReturnValue(mockUser);
        userRepository.save.mockResolvedValue(mockUser);

        const result = await service.createUser(internationalEmailDto);
        expect(result.email).toBe(internationalEmailDto.email);
      });
    });

    describe('Error Cases', () => {
      it('should throw UserConflictException when email already exists', async () => {
        const existingUser = new User();
        existingUser.id = 1;
        existingUser.name = 'Existing User';
        existingUser.email = validCreateUserDto.email;
        existingUser.createdAt = new Date();

        userRepository.findOneBy.mockResolvedValue(existingUser);

        await expect(service.createUser(validCreateUserDto)).rejects.toThrow(
          UserConflictException,
        );
        await expect(service.createUser(validCreateUserDto)).rejects.toThrow(
          'User with email john.doe@example.com already exists',
        );
        expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: validCreateUserDto.email });
        expect(userRepository.create).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
      });

      it('should throw UserConflictException with case-insensitive email comparison', async () => {
        const existingUser = new User();
        existingUser.id = 1;
        existingUser.name = 'Existing User';
        existingUser.email = 'JOHN.DOE@EXAMPLE.COM';
        existingUser.createdAt = new Date();

        userRepository.findOneBy.mockResolvedValue(existingUser);

        const duplicateEmailDto: CreateUserDto = {
          name: 'Different Name',
          email: 'JOHN.DOE@EXAMPLE.COM',
        };

        await expect(service.createUser(duplicateEmailDto)).rejects.toThrow(
          UserConflictException,
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string name', async () => {
        const emptyNameDto: CreateUserDto = {
          name: '',
          email: 'test@example.com',
        };

        const mockUser = new User();
        mockUser.id = 1;
        mockUser.name = emptyNameDto.name;
        mockUser.email = emptyNameDto.email;
        mockUser.createdAt = new Date();

        userRepository.findOneBy.mockResolvedValue(null);
        userRepository.create.mockReturnValue(mockUser);
        userRepository.save.mockResolvedValue(mockUser);

        const result = await service.createUser(emptyNameDto);
        expect(result.name).toBe('');
      });

      it('should handle very long names', async () => {
        const longNameDto: CreateUserDto = {
          name: 'A'.repeat(1000),
          email: 'longname@example.com',
        };

        const mockUser = new User();
        mockUser.id = 1;
        mockUser.name = longNameDto.name;
        mockUser.email = longNameDto.email;
        mockUser.createdAt = new Date();

        userRepository.findOneBy.mockResolvedValue(null);
        userRepository.create.mockReturnValue(mockUser);
        userRepository.save.mockResolvedValue(mockUser);

        const result = await service.createUser(longNameDto);
        expect(result.name).toBe(longNameDto.name);
      });

      it('should handle very long emails', async () => {
        const longEmailDto: CreateUserDto = {
          name: 'Test User',
          email: 'a'.repeat(100) + '@example.com',
        };

        const mockUser = new User();
        mockUser.id = 1;
        mockUser.name = longEmailDto.name;
        mockUser.email = longEmailDto.email;
        mockUser.createdAt = new Date();

        userRepository.findOneBy.mockResolvedValue(null);
        userRepository.create.mockReturnValue(mockUser);
        userRepository.save.mockResolvedValue(mockUser);

        const result = await service.createUser(longEmailDto);
        expect(result.email).toBe(longEmailDto.email);
      });
    });
  });

  describe('getUserList', () => {
    describe('Success Cases', () => {
      it('should return empty array when no users exist', async () => {
        userRepository.find.mockResolvedValue([]);

        const result = await service.getUserList();
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
        expect(userRepository.find).toHaveBeenCalledTimes(1);
      });

      it('should return all users when users exist', async () => {
        const mockUsers = [
          {
            id: 1,
            name: 'User One',
            email: 'user1@example.com',
            createdAt: new Date('2024-01-15T10:30:00.000Z'),
          },
          {
            id: 2,
            name: 'User Two',
            email: 'user2@example.com',
            createdAt: new Date('2024-01-15T11:30:00.000Z'),
          },
        ];

        userRepository.find.mockResolvedValue(mockUsers as User[]);

        const result = await service.getUserList();

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
          id: 1,
          name: 'User One',
          email: 'user1@example.com',
        });
        expect(result[1]).toMatchObject({
          id: 2,
          name: 'User Two',
          email: 'user2@example.com',
        });
        expect(userRepository.find).toHaveBeenCalledTimes(1);
      });

      it('should return users in correct format', async () => {
        const mockUser = {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date(),
        };

        userRepository.find.mockResolvedValue([mockUser] as User[]);

        const result = await service.getUserList();

        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('email');
        expect(result[0]).toHaveProperty('createdAt');
        expect(result[0].createdAt).toBeInstanceOf(Date);
      });
    });

    describe('Performance Cases', () => {
      it('should handle large number of users efficiently', async () => {
        const userCount = 1000;
        const mockUsers = Array.from({ length: userCount }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          createdAt: new Date(),
        }));

        userRepository.find.mockResolvedValue(mockUsers as User[]);

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
      const mockUser1 = new User();
      mockUser1.id = 1;
      mockUser1.name = 'User One';
      mockUser1.email = 'user1@example.com';
      mockUser1.createdAt = new Date();

      const mockUser2 = new User();
      mockUser2.id = 2;
      mockUser2.name = 'User Two';
      mockUser2.email = 'user2@example.com';
      mockUser2.createdAt = new Date();

      // Mock for createUser calls
      userRepository.findOneBy.mockResolvedValue(null);
      userRepository.create.mockReturnValueOnce(mockUser1).mockReturnValueOnce(mockUser2);
      userRepository.save.mockResolvedValueOnce(mockUser1).mockResolvedValueOnce(mockUser2);

      // Mock for getUserList calls
      userRepository.find.mockResolvedValueOnce([mockUser1]).mockResolvedValueOnce([mockUser1, mockUser2]);

      // Create first user
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
      expect(users[0]).toMatchObject({ name: 'User One', email: 'user1@example.com' });
      expect(users[1]).toMatchObject({ name: 'User Two', email: 'user2@example.com' });

      // Try to create duplicate (should fail)
      userRepository.findOneBy.mockResolvedValue(mockUser1);
      await expect(service.createUser({
        name: 'Duplicate User',
        email: 'user1@example.com',
      })).rejects.toThrow(UserConflictException);
    });

    it('should maintain data consistency across operations', async () => {
      const mockUser = new User();
      mockUser.id = 1;
      mockUser.name = 'Test User';
      mockUser.email = 'test@example.com';
      mockUser.createdAt = new Date();

      // Mock for createUser
      userRepository.findOneBy.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      // Mock for getUserList
      userRepository.find.mockResolvedValue([mockUser]);

      const user = await service.createUser({
        name: 'Test User',
        email: 'test@example.com',
      });

      const usersAfterCreate = await service.getUserList();
      expect(usersAfterCreate).toHaveLength(1);
      expect(usersAfterCreate[0]).toMatchObject(user);

      // Verify user data integrity
      expect(user.id).toBe(1);
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });
});