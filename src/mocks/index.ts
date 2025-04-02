// src/mocks/index.ts
// Export all mocks for convenient import

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

/**
 * Sets up the test environment with mocks
 */
export function setupTestEnv() {
  // Reset all mocks before use
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Cleanup after all tests
  afterAll(() => {
    jest.resetAllMocks();
  });
}

/**
 * Convenient access to mock API responses
 */
export { mockApiResponses } from './api'; 