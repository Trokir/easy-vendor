import 'reflect-metadata';

// Setup global mock objects for backend tests
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Setup TypeORM mapping (if needed)
jest.mock('typeorm', () => {
  const originalModule = jest.requireActual('typeorm');
  return {
    ...originalModule,
    getRepository: jest.fn(),
    getCustomRepository: jest.fn(),
    createConnection: jest.fn().mockResolvedValue({
      close: jest.fn().mockResolvedValue(undefined),
    }),
  };
});

// Clean up all mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});

// Set environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRATION = '3600';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test_db';
process.env.NODE_ENV = 'test';

// Setup Jest for NestJS tests
jest.setTimeout(10000);

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Suppress console warnings in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

console.error = (...args: any[]) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('Nest could not find') ||
      args[0].includes('Nest can\'t resolve dependencies') ||
      args[0].includes('Invalid options object') ||
      args[0].includes('ECONREFUSED'))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args: any[]) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('Nest could not find') ||
      args[0].includes('Not implemented') ||
      args[0].includes('deprecated') ||
      args[0].includes('experimental'))
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

console.log = (...args: any[]) => {
  if (process.env.DEBUG_TESTS) {
    originalConsoleLog.call(console, ...args);
  }
};

// Helper functions for testing
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); 