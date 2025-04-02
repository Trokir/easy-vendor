// jest.backend.config.js
const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  displayName: 'backend',
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.backend.ts'],
  testMatch: [
    '<rootDir>/src/services/**/?(*.)+(spec|test).[tj]s',
    '<rootDir>/src/controllers/**/?(*.)+(spec|test).[tj]s',
    '<rootDir>/src/middlewares/**/?(*.)+(spec|test).[tj]s',
    '<rootDir>/src/tests/unit/**/?(*.)+(spec|test).[tj]s',
    '<rootDir>/src/tests/integration/**/?(*.)+(spec|test).[tj]s',
  ],
  transform: {
    ...tsjPreset.transform,
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^axios$': '<rootDir>/src/mocks/axios-mock.js',
    '^@sendgrid/mail$': '<rootDir>/src/mocks/sendgrid-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@sendgrid)/)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      isolatedModules: true,
    },
  },
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/controllers/**/*.ts',
    'src/middlewares/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  verbose: true,
}; 