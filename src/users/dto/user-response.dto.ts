/**
 * Data Transfer Object for user responses
 * Defines the structure of user data returned by the API
 */
import { Expose } from 'class-transformer';

export class UserResponseDto {
  /**
   * Unique identifier for the user
   */
  @Expose()
  id: number;

  /**
   * User's full name
   */
  @Expose()
  name: string;

  /**
   * User's email address
   */
  @Expose()
  email: string;

  /**
   * Timestamp when the user was created
   */
  @Expose()
  createdAt: Date;
}