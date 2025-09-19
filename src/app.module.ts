/**
 * Root application module
 * Configures all global modules, middleware, guards, and filters
 */
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LoggingMiddleware } from './logging/logging.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    // Database configuration with SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User],
      synchronize: true, // Only for development - auto-sync schema changes
      logging: false, // Disable query logging for production
    }),
    // Rate limiting configuration
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time window: 1 minute
      limit: 10, // Maximum 10 requests per minute globally
    }]),
    // Feature modules
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global exception filter for centralized error handling
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configure global middleware
   * Applies logging middleware to all routes
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
