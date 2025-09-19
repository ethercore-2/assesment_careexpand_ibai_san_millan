/**
 * Root application controller
 * Handles basic application endpoints
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * GET /
   * @returns string - Welcome message
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
