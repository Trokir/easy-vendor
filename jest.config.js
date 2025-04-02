const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  projects: [
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/tests/unit/services/**/*.spec.ts',
        '<rootDir>/src/tests/unit/controllers/**/*.spec.ts',
        '<rootDir>/src/tests/integration/**/*.spec.ts',
      ],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.backend.ts'],
      transform: {
        ...tsjPreset.transform,
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^axios$': '<rootDir>/src/mocks/axios-mock.js',
        '^@sendgrid/mail$': '<rootDir>/src/mocks/sendgrid-mock.js'
      },
      transformIgnorePatterns: [
        'node_modules/(?!(@mui|react-router|react-router-dom)/)'
      ],
    },
    {
      displayName: 'frontend',
      testMatch: [
        '<rootDir>/src/components/**/*.test.{ts,tsx}',
        '<rootDir>/src/hooks/**/*.test.{ts,tsx}',
        '<rootDir>/src/utils/**/*.test.{ts,tsx}',
      ],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: 'tsconfig.json',
          },
        ],
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testEnvironmentOptions: {
        url: 'http://localhost/',
        customExportConditions: [''],
        testURL: 'http://localhost/'
      },
    },
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**/*',
    '!src/mocks/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
};
