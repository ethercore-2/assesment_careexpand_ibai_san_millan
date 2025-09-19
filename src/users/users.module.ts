/**
 * Users module
 * Configures user-related functionality including controller, service, and database integration
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    // Register User entity with TypeORM for database operations
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  // Export service to make it available to other modules
  exports: [UsersService],
})
export class UsersModule {}
