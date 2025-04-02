// jest.backend.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/tests/unit/services/**/*.spec.ts',
    '<rootDir>/src/tests/unit/controllers/**/*.spec.ts',
    '<rootDir>/src/tests/integration/**/*.spec.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.backend.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^axios$': '<rootDir>/src/mocks/axios-mock.js',
    '^@sendgrid/mail$': '<rootDir>/src/mocks/sendgrid-mock.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@mui|react-router|react-router-dom)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!**/*.test.{ts,tsx}',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true,
  bail: false
}; 