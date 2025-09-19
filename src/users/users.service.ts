import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserConflictException } from '../common/exceptions/user-conflict.exception';
import axios from 'axios';

@Injectable()
export class UsersService {
  private users: Map<number, UserResponseDto> = new Map();
  private nextId = 1;

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists (case-insensitive)
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === createUserDto.email.toLowerCase()) {
        throw new UserConflictException(createUserDto.email);
      }
    }

    // Create new user
    const newUser: UserResponseDto = {
      id: this.nextId++,
      name: createUserDto.name,
      email: createUserDto.email,
      createdAt: new Date(),
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getUserList(): Promise<UserResponseDto[]> {
    return Array.from(this.users.values());
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
