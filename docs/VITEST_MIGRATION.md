# Migrating from Jest to Vitest

This document describes the process and benefits of migrating our testing infrastructure from Jest to Vitest.

## Why Vitest?

Vitest offers several advantages over Jest:

1. **Performance**: Vitest is significantly faster than Jest, especially for large test suites.
2. **Vue/React Support**: Better integration with Vue and React components.
3. **ESM Support**: Native support for ES modules.
4. **Compatibility**: API compatible with Jest, making migration straightforward.
5. **Watch Mode**: Improved watch mode with smart detection of changed files.

## Migration Changes

### Configuration Files

- Replaced `jest.config.js` with `vitest.config.ts`
- Updated test scripts in `package.json`

### Package Dependencies

Added:
- `vitest`
- `@vitest/coverage-v8`
- `happy-dom` (for DOM testing environment)

Removed:
- `jest`
- `jest-environment-jsdom`
- `ts-jest`

### Test Files

- Updated imports from Jest to Vitest
- Moved test files to a dedicated `tests` directory
- Organized tests by type (frontend/backend) and category (components/hooks/services)

### Running Tests

```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Status

Migration completed as part of Task #63. All tests are now running with Vitest. 