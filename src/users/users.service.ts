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

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists (case-insensitive)
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new UserConflictException(createUserDto.email);
    }

    // Create new user entity
    const newUser = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(newUser);

    // Convert to response DTO
    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };
  }

  async getUserList(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    
    if (!users) {
      return [];
    }
    
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }));
  }

  async getExternalUsers(): Promise<any[]> {
    try {
      const response = await axios.get('https://reqres.in/api/users');
      
      // Handle different response structures
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.users) {
        return response.data.users;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        throw new Error('Invalid response structure from external API');
      }
    } catch (error) {
      throw new Error('Failed to fetch external users');
    }
  }
}
