// src/mocks/index.ts
// Export all mocks for convenient import

import { vi } from 'vitest';
import { setupMockFetch } from './api';
import { mockLocalStorage } from './test-utils';

// Service mocks
export * from './services';

// API mocks
export * from './api';

// Context mocks
export * from './context';

// Testing helpers
export const testUtils = {
  /**
   * Creates a mock response for fetch
   */
  createFetchResponse: <T>(data: T): Promise<Response> => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data)
    } as Response);
  },

  /**
   * Creates a mock error response for fetch
   */
  createErrorResponse: (status = 400, message = 'Bad Request'): Promise<Response> => {
    return Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ error: true, message })
    } as Response);
  },
  
  /**
   * Waits for all asynchronous operations to complete
   */
  waitForAsync: async (timeout = 0): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, timeout));
  }
};

let cleanupFetch: () => void;
let originalLocalStorage: Storage;

/**
 * Sets up the test environment with mocks
 */
export function setupTestEnv() {
  // Reset all mocks before each test - эта часть перемещена в конфигурацию Vitest
  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });
  
  // Cleanup after all tests - эта часть перемещена в конфигурацию Vitest
  // afterAll(() => {
  //   jest.resetAllMocks();
  // });
  
  // Mock fetch API
  cleanupFetch = setupMockFetch();
  
  // Mock localStorage
  originalLocalStorage = window.localStorage;
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage()
  });
  
  return () => {
    // Cleanup function
    cleanupFetch();
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage
    });
  };
}

/**
 * Convenient access to mock API responses
 */
export { mockApiResponses } from './api'; 