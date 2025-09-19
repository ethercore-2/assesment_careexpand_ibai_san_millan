# 🚀 User Management Service - Quick Start

A NestJS microservice for user management with external API integration, database persistence, and rate limiting.

## ⚡ Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the application
npm run start:dev

# 3. Application runs on http://localhost:3000
```

## 🎯 Available Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging
npm run start:prod         # Start production build

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
npm run build              # Build for production
```

## 📡 API Endpoints

### Users
- **POST /users** - Create a new user
  ```bash
  curl -X POST http://localhost:3000/users \
    -H "Content-Type: application/json" \
    -d '{"name": "John Doe", "email": "john@example.com"}'
  ```

- **GET /users** - Get all users
  ```bash
  curl http://localhost:3000/users
  ```

### Health Check
- **GET /** - Application status
  ```bash
  curl http://localhost:3000/
  ```

## 🔧 Configuration

### Environment Variables
```env
PORT=3000                  # Server port (default: 3000)
NODE_ENV=development       # Environment mode
```

### Rate Limits
- **Global**: 10 requests/minute
- **POST /users**: 5 requests/minute
- **GET /users**: 20 requests/minute

## 🗄️ Database

- **Type**: SQLite (file: `database.sqlite`)
- **ORM**: TypeORM with auto-sync
- **Features**: Persistent storage, automatic timestamps

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:cov

# Watch mode for development
npm run test:watch
```

**Test Coverage**: 71.63% (200 tests passing)

## 🚀 Future Improvements

### 🔐 Authentication & Security
- [ ] JWT authentication
- [ ] User roles and permissions
- [ ] Password hashing and validation
- [ ] API key management
- [ ] OAuth2 integration

### 📊 User Management
- [ ] User profile management
- [ ] User search and filtering
- [ ] User activity logging
- [ ] User preferences and settings
- [ ] User avatar upload
- [ ] User notifications system

### 🗄️ Database & Performance
- [ ] PostgreSQL/MySQL migration
- [ ] Database migrations
- [ ] Query optimization
- [ ] Caching layer (Redis)
- [ ] Database connection pooling

### 📈 Monitoring & Analytics
- [ ] Health check endpoints
- [ ] Metrics and monitoring
- [ ] Logging aggregation
- [ ] Performance monitoring
- [ ] User analytics dashboard

### 🔄 API Enhancements
- [ ] GraphQL API
- [ ] API versioning
- [ ] Swagger/OpenAPI documentation
- [ ] API rate limiting per user
- [ ] Webhook support

### 🛠️ DevOps & Deployment
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] Environment configuration
- [ ] Load balancing

### 📱 Frontend Integration
- [ ] React/Vue.js frontend
- [ ] Mobile app API
- [ ] Real-time updates (WebSocket)
- [ ] PWA support

## 🏗️ Project Structure

```
src/
├── common/           # Shared utilities
├── logging/          # Request logging
├── users/            # User management
│   ├── dto/         # Data transfer objects
│   ├── entities/    # Database entities
│   └── *.ts         # Controller, service, module
├── app.*.ts         # Main application files
└── main.ts          # Application entry point
```

## 🎯 Key Features

- ✅ **RESTful API** with validation
- ✅ **SQLite database** with TypeORM
- ✅ **External API integration** (reqres.in)
- ✅ **Rate limiting** and security
- ✅ **Request logging** middleware
- ✅ **Error handling** with custom exceptions
- ✅ **Comprehensive testing** (71.63% coverage)
- ✅ **TypeScript** with full type safety
- ✅ **Code documentation** in English

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Author**: Ibai San Millán  
**Version**: 1.0.0  
**License**: MIT
