# Tests Directory

This directory contains all test files organized by type and functionality.

## Structure

```
test/
├── unit/           # Unit tests
│   ├── users/      # User-related unit tests
│   ├── logging/    # Logging middleware unit tests
│   └── common/     # Common utilities unit tests
├── e2e/            # End-to-end tests
│   ├── app.e2e-spec.ts
│   ├── jest-e2e.json
│   └── jest.config.js
└── README.md       # This file
```

## Running Tests

### Unit Tests
```bash
npm run test
npm run test:watch
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

## Test Organization

- **Unit Tests**: Test individual components in isolation
- **E2E Tests**: Test complete user workflows and API endpoints
- **Integration Tests**: Test component interactions (future)

## Coverage

Unit tests aim for 95%+ code coverage across all modules.
