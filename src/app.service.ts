/**
 * Root application service
 * Provides basic application functionality
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Returns a welcome message
   * @returns string - Welcome message
   */
  getHello(): string {
    return 'Hello World!';
  }
}
