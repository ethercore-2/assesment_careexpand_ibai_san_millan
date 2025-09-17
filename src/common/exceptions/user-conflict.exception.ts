import { ConflictException } from '@nestjs/common';

export class UserConflictException extends ConflictException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}