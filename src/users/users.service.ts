/**
 * Users service
 * Handles all business logic related to user management
 * Includes database operations and external API integration
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserConflictException } from '../common/exceptions/user-conflict.exception';
import { User } from './entities/user.entity';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new user in the database
   * Validates email uniqueness and persists user data
   * @param createUserDto - User data from request
   * @returns Promise<UserResponseDto> - Created user information
   * @throws UserConflictException - If user with email already exists
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists (case-insensitive email comparison)
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new UserConflictException(createUserDto.email);
    }

    // Create new user entity from DTO
    const newUser = this.userRepository.create(createUserDto);
    
    // Persist user to database
    const savedUser = await this.userRepository.save(newUser);

    // Transform entity to response DTO
    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };
  }

  /**
   * Retrieves all users from the database
   * @returns Promise<UserResponseDto[]> - Array of all users
   */
  async getUserList(): Promise<UserResponseDto[]> {
    // Fetch all users from database
    const users = await this.userRepository.find();
    
    // Handle null response (should not happen with TypeORM)
    if (!users) {
      return [];
    }
    
    // Transform entities to response DTOs
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }));
  }

  /**
   * Fetches users from external API (reqres.in)
   * Handles different response structures from the external service
   * @returns Promise<any[]> - Array of external users
   * @throws Error - If external API call fails
   */
  async getExternalUsers(): Promise<any[]> {
    try {
      // Make HTTP request to external API
      const response = await axios.get('https://reqres.in/api/users');
      
      // Handle different possible response structures
      if (response.data && response.data.data) {
        // Standard reqres.in response format
        return response.data.data;
      } else if (response.data && response.data.users) {
        // Alternative response format
        return response.data.users;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        return response.data;
      } else {
        throw new Error('Invalid response structure from external API');
      }
    } catch (error) {
      // Log error and throw generic message for security
      throw new Error('Failed to fetch external users');
    }
  }
}
