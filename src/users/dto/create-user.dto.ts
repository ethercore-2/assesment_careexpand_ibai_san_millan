/**
 * Data Transfer Object for creating a new user
 * Contains validation rules for user input
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  /**
   * User's full name
   * Must be a non-empty string with at least 2 characters
   */
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  /**
   * User's email address
   * Must be a valid email format and unique in the system
   */
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}
