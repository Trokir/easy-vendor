require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock database connection
jest.mock('../utils/db', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
  pool: {
    connect: jest.fn(),
    query: jest.fn(),
    release: jest.fn()
  }
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn()
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 