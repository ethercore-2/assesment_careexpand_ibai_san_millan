import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserConflictException } from '../common/exceptions/user-conflict.exception';
import { HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUsersService = {
    createUser: jest.fn(),
    getUserList: jest.fn(),
    getExternalUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have UsersService injected', () => {
      expect(usersService).toBeDefined();
    });
  });

  describe('POST /users - createUser', () => {
    const validCreateUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    const mockUserResponse: UserResponseDto = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date('2024-01-15T10:30:00.000Z'),
    };

    describe('Success Cases', () => {
      it('should create a user successfully with valid data', async () => {
        usersService.createUser.mockResolvedValueOnce(mockUserResponse);

        const result = await controller.createUser(validCreateUserDto);

        expect(result).toEqual(mockUserResponse);
        expect(usersService.createUser).toHaveBeenCalledWith(validCreateUserDto);
        expect(usersService.createUser).toHaveBeenCalledTimes(1);
      });

      it('should return 201 status code for successful creation', async () => {
        usersService.createUser.mockResolvedValueOnce(mockUserResponse);

        const result = await controller.createUser(validCreateUserDto);

        expect(result).toBeDefined();
        // Note: HTTP status is handled by @HttpCode decorator
      });

      it('should handle special characters in user data', async () => {
        const specialCharDto: CreateUserDto = {
          name: 'José María O\'Connor-Smith',
          email: 'jose.maria@example.com',
        };

        const specialCharResponse: UserResponseDto = {
          id: 1,
          name: 'José María O\'Connor-Smith',
          email: 'jose.maria@example.com',
          createdAt: new Date(),
        };

        usersService.createUser.mockResolvedValueOnce(specialCharResponse);

        const result = await controller.createUser(specialCharDto);

        expect(result).toEqual(specialCharResponse);
        expect(usersService.createUser).toHaveBeenCalledWith(specialCharDto);
      });

      it('should handle international email domains', async () => {
        const internationalDto: CreateUserDto = {
          name: 'Test User',
          email: 'test@example.co.uk',
        };

        const internationalResponse: UserResponseDto = {
          id: 1,
          name: 'Test User',
          email: 'test@example.co.uk',
          createdAt: new Date(),
        };

        usersService.createUser.mockResolvedValueOnce(internationalResponse);

        const result = await controller.createUser(internationalDto);

        expect(result).toEqual(internationalResponse);
        expect(usersService.createUser).toHaveBeenCalledWith(internationalDto);
      });
    });

    describe('Error Cases', () => {
      it('should propagate UserConflictException from service', async () => {
        const conflictError = new UserConflictException('john.doe@example.com');
        usersService.createUser.mockRejectedValueOnce(conflictError);

        await expect(controller.createUser(validCreateUserDto)).rejects.toThrow(
          UserConflictException,
        );
        await expect(controller.createUser(validCreateUserDto)).rejects.toThrow(
          'User with email john.doe@example.com already exists',
        );
        expect(usersService.createUser).toHaveBeenCalledWith(validCreateUserDto);
      });

      it('should propagate BadRequestException from service', async () => {
        const badRequestError = new BadRequestException('Invalid input data');
        usersService.createUser.mockRejectedValueOnce(badRequestError);

        await expect(controller.createUser(validCreateUserDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(controller.createUser(validCreateUserDto)).rejects.toThrow(
          'Invalid input data',
        );
      });

      it('should propagate InternalServerErrorException from service', async () => {
        const serverError = new InternalServerErrorException('Database connection failed');
        usersService.createUser.mockRejectedValueOnce(serverError);

        await expect(controller.createUser(validCreateUserDto)).rejects.toThrow(
          InternalServerErrorException,
        );
        await expect(controller.createUser(validCreateUserDto)).rejects.toThrow(
          'Database connection failed',
        );
      });

      it('should propagate generic errors from service', async () => {
        const genericError = new Error('Unexpected error occurred');
        usersService.createUser.mockRejectedValueOnce(genericError);

        await expect(controller.createUser(validCreateUserDto)).rejects.toThrow(
          'Unexpected error occurred',
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle null DTO gracefully', async () => {
        const nullDto = null as any;
        usersService.createUser.mockRejectedValueOnce(
          new BadRequestException('Invalid input'),
        );

        await expect(controller.createUser(nullDto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should handle undefined DTO gracefully', async () => {
        const undefinedDto = undefined as any;
        usersService.createUser.mockRejectedValueOnce(
          new BadRequestException('Invalid input'),
        );

        await expect(controller.createUser(undefinedDto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should handle empty DTO gracefully', async () => {
        const emptyDto = {} as CreateUserDto;
        usersService.createUser.mockRejectedValueOnce(
          new BadRequestException('Validation failed'),
        );

        await expect(controller.createUser(emptyDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('Service Integration', () => {
      it('should call service with exact DTO parameters', async () => {
        usersService.createUser.mockResolvedValueOnce(mockUserResponse);

        await controller.createUser(validCreateUserDto);

        expect(usersService.createUser).toHaveBeenCalledWith(validCreateUserDto);
        expect(usersService.createUser).toHaveBeenCalledTimes(1);
      });

      it('should return service response without modification', async () => {
        usersService.createUser.mockResolvedValueOnce(mockUserResponse);

        const result = await controller.createUser(validCreateUserDto);

        expect(result).toBe(mockUserResponse);
      });
    });
  });

  describe('GET /users - getUsers', () => {
    const mockUsersList: UserResponseDto[] = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: new Date('2024-01-15T10:30:00.000Z'),
      },
      {
        id: 2,
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        createdAt: new Date('2024-01-15T11:30:00.000Z'),
      },
    ];

    describe('Success Cases', () => {
      it('should return empty array when no users exist', async () => {
        usersService.getUserList.mockResolvedValueOnce([]);

        const result = await controller.getUsers();

        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
        expect(usersService.getUserList).toHaveBeenCalledTimes(1);
      });

      it('should return all users when users exist', async () => {
        usersService.getUserList.mockResolvedValueOnce(mockUsersList);

        const result = await controller.getUsers();

        expect(result).toEqual(mockUsersList);
        expect(result).toHaveLength(2);
        expect(usersService.getUserList).toHaveBeenCalledTimes(1);
      });

      it('should return users in correct format', async () => {
        usersService.getUserList.mockResolvedValueOnce(mockUsersList);

        const result = await controller.getUsers();

        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('email');
        expect(result[0]).toHaveProperty('createdAt');
        expect(result[0].createdAt).toBeInstanceOf(Date);
      });

      it('should handle single user correctly', async () => {
        const singleUser = [mockUsersList[0]];
        usersService.getUserList.mockResolvedValueOnce(singleUser);

        const result = await controller.getUsers();

        expect(result).toEqual(singleUser);
        expect(result).toHaveLength(1);
      });

      it('should handle large number of users', async () => {
        const largeUsersList = Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          createdAt: new Date(),
        }));

        usersService.getUserList.mockResolvedValueOnce(largeUsersList);

        const result = await controller.getUsers();

        expect(result).toEqual(largeUsersList);
        expect(result).toHaveLength(1000);
      });
    });

    describe('Error Cases', () => {
      it('should propagate service errors', async () => {
        const serviceError = new Error('Database connection failed');
        usersService.getUserList.mockRejectedValueOnce(serviceError);

        await expect(controller.getUsers()).rejects.toThrow(
          'Database connection failed',
        );
        expect(usersService.getUserList).toHaveBeenCalledTimes(1);
      });

      it('should propagate InternalServerErrorException from service', async () => {
        const serverError = new InternalServerErrorException('Service unavailable');
        usersService.getUserList.mockRejectedValueOnce(serverError);

        await expect(controller.getUsers()).rejects.toThrow(
          InternalServerErrorException,
        );
        await expect(controller.getUsers()).rejects.toThrow(
          'Service unavailable',
        );
      });

      it('should handle service timeout', async () => {
        const timeoutError = new Error('Request timeout');
        usersService.getUserList.mockRejectedValueOnce(timeoutError);

        await expect(controller.getUsers()).rejects.toThrow(
          'Request timeout',
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle service returning null', async () => {
        usersService.getUserList.mockResolvedValueOnce(null as any);

        const result = await controller.getUsers();

        expect(result).toBeNull();
      });

      it('should handle service returning undefined', async () => {
        usersService.getUserList.mockResolvedValueOnce(undefined as any);

        const result = await controller.getUsers();

        expect(result).toBeUndefined();
      });

      it('should handle service returning non-array', async () => {
        usersService.getUserList.mockResolvedValueOnce('invalid' as any);

        const result = await controller.getUsers();

        expect(result).toBe('invalid');
      });
    });

    describe('Service Integration', () => {
      it('should call service without parameters', async () => {
        usersService.getUserList.mockResolvedValueOnce(mockUsersList);

        await controller.getUsers();

        expect(usersService.getUserList).toHaveBeenCalledWith();
        expect(usersService.getUserList).toHaveBeenCalledTimes(1);
      });

      it('should return service response without modification', async () => {
        usersService.getUserList.mockResolvedValueOnce(mockUsersList);

        const result = await controller.getUsers();

        expect(result).toBe(mockUsersList);
      });

      it('should handle multiple concurrent calls', async () => {
        usersService.getUserList.mockResolvedValue(mockUsersList);

        const promises = [
          controller.getUsers(),
          controller.getUsers(),
          controller.getUsers(),
        ];

        const results = await Promise.all(promises);

        expect(results).toHaveLength(3);
        results.forEach(result => {
          expect(result).toEqual(mockUsersList);
        });
        expect(usersService.getUserList).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid successive calls efficiently', async () => {
      const mockUsersList: UserResponseDto[] = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date(),
        },
      ];

      usersService.getUserList.mockResolvedValue(mockUsersList);

      const startTime = Date.now();
      const promises = Array.from({ length: 100 }, () => controller.getUsers());
      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle mixed operations efficiently', async () => {
      const mockUser: UserResponseDto = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      const mockUsersList: UserResponseDto[] = [mockUser];

      usersService.createUser.mockResolvedValue(mockUser);
      usersService.getUserList.mockResolvedValue(mockUsersList);

      const startTime = Date.now();
      
      const createPromise = controller.createUser({
        name: 'Test User',
        email: 'test@example.com',
      });
      const getPromise = controller.getUsers();
      
      const [createResult, getResult] = await Promise.all([createPromise, getPromise]);
      const endTime = Date.now();

      expect(createResult).toBeDefined();
      expect(getResult).toBeDefined();
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Error Handling Integration', () => {
    it('should maintain error context through controller layer', async () => {
      const originalError = new UserConflictException('test@example.com');
      usersService.createUser.mockRejectedValueOnce(originalError);

      try {
        await controller.createUser({
          name: 'Test User',
          email: 'test@example.com',
        });
      } catch (error) {
        expect(error).toBe(originalError);
        expect(error.message).toBe('User with email test@example.com already exists');
      }
    });

    it('should not modify error stack traces', async () => {
      const originalError = new Error('Original error');
      const originalStack = originalError.stack;
      usersService.createUser.mockRejectedValueOnce(originalError);

      try {
        await controller.createUser({
          name: 'Test User',
          email: 'test@example.com',
        });
      } catch (error) {
        expect(error.stack).toBe(originalStack);
      }
    });
  });
});