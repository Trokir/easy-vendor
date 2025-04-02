// jest.frontend.config.js
module.exports = {
  displayName: 'frontend',
  testMatch: [
    '<rootDir>/src/components/**/*.test.{ts,tsx}',
    '<rootDir>/src/hooks/**/*.test.{ts,tsx}',
    '<rootDir>/src/utils/**/*.test.{ts,tsx}',
    '<rootDir>/src/tests/unit/components/**/*.spec.{ts,tsx}',
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
    '^axios$': '<rootDir>/src/mocks/axios-mock.js',
    '^@sendgrid/mail$': '<rootDir>/src/mocks/sendgrid-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@mui|react-router|react-router-dom)/)'
  ],
  testEnvironmentOptions: {
    url: 'http://localhost/',
    customExportConditions: [''],
    testURL: 'http://localhost/'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', 'src'],
  verbose: true,
  bail: false,
  resolver: undefined
}; 