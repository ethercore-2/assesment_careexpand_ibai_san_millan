/**
 * Users controller
 * Handles HTTP requests for user-related operations
 * Implements rate limiting and proper HTTP status codes
 */
import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a new user
   * POST /users
   * @param createUserDto - User data from request body
   * @returns Promise<UserResponseDto> - Created user information
   */
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 Created
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for POST
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(createUserDto);
  }

  /**
   * Retrieves all users
   * GET /users
   * @returns Promise<UserResponseDto[]> - Array of all users
   */
  @Get()
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute for GET
  async getUsers(): Promise<UserResponseDto[]> {
    return this.usersService.getUserList();
  }
}
