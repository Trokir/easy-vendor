// jest.frontend.config.js
module.exports = {
  displayName: 'frontend',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
      isolatedModules: true,
      useESM: true,
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/components/**/?(*.)+(spec|test).[jt]s?(x)',
    '<rootDir>/src/hooks/**/?(*.)+(spec|test).[jt]s?(x)',
    '<rootDir>/src/utils/**/?(*.)+(spec|test).[jt]s?(x)',
    '<rootDir>/src/contexts/**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^axios$': '<rootDir>/src/mocks/axios-mock.js',
    '^@sendgrid/mail$': '<rootDir>/src/mocks/sendgrid-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@mui|@emotion|react-router|react-router-dom)/)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      isolatedModules: true,
      useESM: true,
    },
  },
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/utils/**/*.{ts,tsx}',
    'src/contexts/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
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