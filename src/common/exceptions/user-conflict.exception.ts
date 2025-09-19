/**
 * Custom exception for user conflict scenarios
 * Thrown when attempting to create a user with an email that already exists
 */
import { ConflictException } from '@nestjs/common';

export class UserConflictException extends ConflictException {
  /**
   * Creates a new UserConflictException
   * @param email - The email address that already exists
   */
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}