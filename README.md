# User Management Service

A NestJS-based microservice for managing users with external API integration, built following clean architecture principles and best practices.

## 🚀 Features

- **User Management**: Create and list users with validation
- **External API Integration**: Fetch data from reqres.in API
- **Request Logging**: Comprehensive middleware for request tracking
- **Error Handling**: Centralized error management with custom exceptions
- **Rate Limiting**: Protection against abuse with configurable limits
- **Data Validation**: DTOs with class-validator decorators
- **TypeScript**: Full type safety and IntelliSense support
- **Testing**: Comprehensive unit tests with Jest

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ethercore-2/assesment_careexpand_ibai_san_millan.git
cd assesment_careexpand_ibai_san_millan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### 4. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── users/                    # User management module
│   ├── dto/                  # Data Transfer Objects
│   │   ├── create-user.dto.ts
│   │   └── user-response.dto.ts
│   ├── users.controller.ts   # User endpoints
│   ├── users.service.ts      # User business logic
│   └── users.module.ts       # User module configuration
├── logging/                  # Logging middleware
│   └── logging.middleware.ts
├── app.module.ts             # Main application module
└── main.ts                   # Application entry point
```

## 📚 API Endpoints

### POST /users
Create a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /users
Get all users

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

## 🛡️ Rate Limiting

The API implements rate limiting to protect against abuse and ensure fair usage:

### Rate Limits
- **GET /users**: 20 requests per minute per IP
- **POST /users**: 5 requests per minute per IP
- **Global limit**: 10 requests per minute per IP (fallback)

### Rate Limit Headers
All responses include rate limiting information:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 19
X-RateLimit-Reset: 60
```

### Rate Limit Exceeded
When rate limits are exceeded, the API returns:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

## 🔧 Development Methodology

### 1. Clean Architecture Principles
- **Separation of Concerns**: Each module has a single responsibility
- **Dependency Injection**: Services are injected where needed
- **Interface Segregation**: DTOs define clear contracts
- **Error Handling**: Centralized exception management

### 2. Code Organization
- **Modular Structure**: Features are organized in modules
- **DTO Pattern**: Data validation and transformation
- **Service Layer**: Business logic separation
- **Middleware**: Cross-cutting concerns

### 3. Best Practices Implemented
- **TypeScript**: Full type safety
- **Validation**: Input validation with class-validator
- **Error Handling**: Custom exceptions and global filters
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Logging**: Request/response tracking
- **Testing**: Unit tests for all components

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📦 Dependencies

### Production Dependencies
- `@nestjs/common`: NestJS core functionality
- `@nestjs/core`: NestJS core framework
- `@nestjs/platform-express`: Express platform adapter
- `class-validator`: Validation decorators
- `class-transformer`: Data transformation
- `axios`: HTTP client for external APIs

### Development Dependencies
- `@nestjs/cli`: NestJS command line interface
- `@nestjs/testing`: Testing utilities
- `jest`: Testing framework
- `typescript`: TypeScript compiler
- `eslint`: Code linting
- `prettier`: Code formatting

## 🚀 Deployment

### Docker (Optional)
```bash
# Build Docker image
docker build -t user-management-service .

# Run container
docker run -p 3000:3000 user-management-service
```

### Environment Variables
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## 📝 API Documentation

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ibai San Millán** - *Initial work* - [ethercore-2](https://github.com/ethercore-2)

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- reqres.in for providing test API endpoints
- The open-source community for various packages used