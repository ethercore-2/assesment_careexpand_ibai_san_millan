# User Management Service

A NestJS microservice for managing users with database persistence, rate limiting, and comprehensive validation.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm package manager

### Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the application
npm run start:dev

# 3. Application runs on http://localhost:3000
```

## 📡 API Usage

### Create a User
```bash
# PowerShell (Windows)
Invoke-RestMethod -Uri "http://localhost:3000/users" -Method POST -ContentType "application/json" -Body '{"name": "John Doe", "email": "john@example.com"}'

# curl (Linux/Mac)
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Get All Users
```bash
# PowerShell (Windows)
Invoke-RestMethod -Uri "http://localhost:3000/users" -Method GET

# curl (Linux/Mac)
curl http://localhost:3000/users
```

### Health Check
```bash
# PowerShell (Windows)
Invoke-RestMethod -Uri "http://localhost:3000/" -Method GET

# curl (Linux/Mac)
curl http://localhost:3000/
```

## 📊 API Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/` | Health check | 10/min |
| POST | `/users` | Create user | 5/min |
| GET | `/users` | Get all users | 20/min |

## 🗄️ Database

- **Type**: SQLite (`database.sqlite`)
- **ORM**: TypeORM with auto-sync
- **Features**: Persistent storage, automatic timestamps

## 🛡️ Features

- ✅ **RESTful API** with validation
- ✅ **SQLite database** with TypeORM
- ✅ **Rate limiting** (5 POST/min, 20 GET/min)
- ✅ **Request logging** middleware
- ✅ **Error handling** with custom exceptions
- ✅ **Data validation** (name min 2 chars, valid email)
- ✅ **TypeScript** with full type safety

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch
```

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

## 📦 Available Commands

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

## 📝 Example Responses

### Create User Response
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Get Users Response
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

**Author**: Ibai San Millán  
**Version**: 1.0.0