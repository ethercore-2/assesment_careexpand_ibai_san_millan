import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/entities/user.entity';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { UserResponseDto } from '../../../src/users/dto/user-response.dto';
import { UserConflictException } from '../../../src/common/exceptions/user-conflict.exception';

describe('UsersService (Database Integration)', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOneBy: jest.fn(),
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

      it('should handle case-insensitive email comparison', async () => {
        const mockUser = new User();
        mockUser.id = 1;
        mockUser.name = validCreateUserDto.name;
        mockUser.email = validCreateUserDto.email;
        mockUser.createdAt = new Date();

        userRepository.findOneBy.mockResolvedValue(null);
        userRepository.create.mockReturnValue(mockUser);
        userRepository.save.mockResolvedValue(mockUser);

        const result = await service.createUser(validCreateUserDto);

        expect(result).toBeDefined();
        expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: validCreateUserDto.email });
      });

      it('should create user with special characters in name', async () => {
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

        await expect(service.createUser(validCreateUserDto)).rejects.toThrow(
          UserConflictException,
        );
      });

      it('should handle database errors gracefully', async () => {
        userRepository.findOneBy.mockRejectedValue(new Error('Database connection failed'));

        await expect(service.createUser(validCreateUserDto)).rejects.toThrow(
          'Database connection failed',
        );
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

    describe('Error Cases', () => {
      it('should handle database errors gracefully', async () => {
        userRepository.find.mockRejectedValue(new Error('Database query failed'));

        await expect(service.getUserList()).rejects.toThrow('Database query failed');
      });

      it('should handle null response from database', async () => {
        userRepository.find.mockResolvedValue(null as any);

        const result = await service.getUserList();

        expect(result).toEqual([]);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle mixed operations correctly', async () => {
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

      // Create user
      const createdUser = await service.createUser({
        name: 'Test User',
        email: 'test@example.com',
      });

      // Get user list
      const users = await service.getUserList();

      expect(createdUser).toBeDefined();
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject(createdUser);
    });

    it('should maintain data consistency across operations', async () => {
      const mockUser = new User();
      mockUser.id = 1;
      mockUser.name = 'Test User';
      mockUser.email = 'test@example.com';
      mockUser.createdAt = new Date();

      userRepository.findOneBy.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      userRepository.find.mockResolvedValue([mockUser]);

      const user = await service.createUser({
        name: 'Test User',
        email: 'test@example.com',
      });

      const users = await service.getUserList();

      expect(user.id).toBe(1);
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual(user);
    });
  });

  describe('Performance Tests', () => {
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
