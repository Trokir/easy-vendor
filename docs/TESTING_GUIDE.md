# Testing Guide for Easy Vendor Project

## Introduction

This document describes the testing approaches for various parts of the Easy Vendor project. Follow these recommendations to ensure consistency and quality of tests.

## Test Structure

```
project/
├── src/
│   ├── components/       # React components
│   ├── services/         # NestJS services
│   ├── controllers/      # NestJS controllers
│   └── ...
├── __tests__/            # Frontend tests (React)
└── src/tests/            # Backend tests (NestJS)
    ├── unit/             # Unit tests
    └── integration/      # Integration tests
```

## Frontend Testing

### React Test Setup

For testing React components, use Jest and React Testing Library:

```bash
npm run test:frontend
```

### Mocks for Frontend Tests

#### Context Providers

Use the provided mocks for context providers:

```typescript
import { renderWithProviders } from '../mocks/test-utils';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly with auth context', () => {
    renderWithProviders(<YourComponent />, {
      initialAuth: { isAuthenticated: true, user: { id: 1, name: 'Test User' } }
    });
    
    // Checks...
  });
});
```

#### API Mocks

Mock API calls using `setupMockFetch`:

```typescript
import { setupMockFetch } from '../mocks/api';

describe('Component with API calls', () => {
  it('fetches data correctly', async () => {
    // API mock setup
    const cleanupMock = setupMockFetch({
      '/api/users': { users: [{ id: 1, name: 'Test User' }] }
    });
    
    // Component testing
    
    // Cleanup after test
    cleanupMock();
  });
});
```

## Backend Testing

### NestJS Unit Tests

To run backend tests:

```bash
npm run test:backend
```

### Testing Services

#### Mocking TypeORM Repositories

Use the `createMockRepository` utility to mock repositories:

```typescript
import { createMockRepository } from '../../utils/typeorm-test-utils';

// In beforeEach:
const module: TestingModule = await Test.createTestingModule({
  providers: [
    YourService,
    {
      provide: getRepositoryToken(Entity),
      useValue: createMockRepository<Entity>()
    }
  ],
}).compile();
```

#### Setting Up Mocks for External Services

```typescript
// Mocking ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'SENDGRID_API_KEY') return 'test-api-key';
    return null;
  }),
};

// In beforeEach:
const module: TestingModule = await Test.createTestingModule({
  providers: [
    YourService,
    {
      provide: ConfigService,
      useValue: mockConfigService
    }
  ],
}).compile();
```

### Testing Controllers

Use a mock-class approach for services:

```typescript
class MockUserService {
  findAll = jest.fn().mockResolvedValue([{ id: 1, name: 'Test User' }]);
  findOne = jest.fn().mockResolvedValue({ id: 1, name: 'Test User' });
  // Other methods...
}

// In beforeEach:
service = new MockUserService();
const module: TestingModule = await Test.createTestingModule({
  controllers: [UserController],
  providers: [
    {
      provide: UserService,
      useValue: service
    }
  ],
}).compile();
```

## Integration Testing

### Test Database Setup

For integration tests, use a test database:

```typescript
// In setup.ts
import { TypeOrmModule } from '@nestjs/typeorm';

moduleFixture = await Test.createTestingModule({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Entity1, Entity2],
      synchronize: true,
    }),
    // Other imports...
  ],
}).compile();
```

## Common Problems and Solutions

### 1. Tests not waiting for asynchronous operations

**Solution:** Use `waitFor` and `act` to wait for DOM updates:

```typescript
await waitFor(() => {
  expect(screen.getByText('Success!')).toBeInTheDocument();
});
```

### 2. Errors of type "Cannot read property of undefined"

**Solution:** Check that objects are mocked correctly and use default values:

```typescript
const mockUser = { id: 1, name: 'Test' };
const { user = {} } = props; // Default value for protection
```

### 3. Issues with 'reflect-metadata' import

**Solution:** Add import at the beginning of the test file:

```typescript
import 'reflect-metadata';
// Other imports...
```

## Test Examples

### React Component Test Example

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../mocks/test-utils';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  it('renders form fields correctly', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  it('shows error message on empty submission', async () => {
    renderWithProviders(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### NestJS Service Test Example

```typescript
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { createMockRepository } from '../utils/typeorm-test-utils';

describe('UserService', () => {
  let service: UserService;
  let repository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>()
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should find a user by id', async () => {
    const user = { id: 1, name: 'Test User', email: 'test@test.com' };
    repository.findOne.mockResolvedValue(user);
    
    expect(await service.findOne(1)).toEqual(user);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
``` 