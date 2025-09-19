/**
 * Main application bootstrap file
 * Configures and starts the NestJS application with global settings
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap function to initialize and configure the NestJS application
 * Sets up global validation pipes, CORS, and starts the server
 */
async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);
  
  // Configure global validation pipes for automatic DTO validation
  // whitelist: strips properties not defined in DTOs
  // forbidNonWhitelisted: throws error for unknown properties
  // transform: automatically transforms payloads to DTO instances
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable Cross-Origin Resource Sharing for frontend integration
  app.enableCors();
  
  // Get port from environment variable or default to 3000
  const port = process.env.PORT ?? 3000;
  
  // Start the application server
  await app.listen(port);
  
  // Log successful startup
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

// Start the application
bootstrap();
