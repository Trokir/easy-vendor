// src/mocks/api.ts
// Mocks for API requests used in frontend tests

import { vi } from 'vitest';

export const mockApiResponses = {
  // Authentication and users
  login: {
    success: {
      accessToken: 'mock-token-123',
      user: {
        id: 1,
        email: 'test@example.com',
        role: 'user',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }
    },
    error: {
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized'
    }
  },
  
  register: {
    success: {
      id: 2,
      email: 'new@example.com',
      role: 'user',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    },
    error: {
      conflict: {
        statusCode: 409,
        message: 'User with this email already exists',
        error: 'Conflict'
      },
      badRequest: {
        statusCode: 400,
        message: 'You must accept the terms of use',
        error: 'Bad Request'
      }
    }
  },
  
  // Legal consents
  consents: {
    record: {
      success: {
        id: 1,
        userId: 1,
        consentType: 'TERMS_OF_SERVICE',
        version: '1.0',
        acceptedAt: '2025-01-01T00:00:00.000Z',
        ipAddress: '127.0.0.1'
      },
      error: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found'
      }
    },
    status: {
      valid: {
        isValid: true
      },
      invalid: {
        isValid: false
      }
    },
    history: {
      success: [
        {
          id: 1,
          userId: 1,
          consentType: 'TERMS_OF_SERVICE',
          version: '1.0',
          acceptedAt: '2024-01-01T00:00:00.000Z',
          ipAddress: '127.0.0.1'
        },
        {
          id: 2,
          userId: 1,
          consentType: 'PRIVACY_POLICY',
          version: '1.1',
          acceptedAt: '2024-02-15T00:00:00.000Z',
          ipAddress: '127.0.0.1'
        }
      ],
      empty: []
    }
  },
  
  // User profile
  userProfile: {
    get: {
      success: {
        id: 1,
        email: 'test@example.com',
        role: 'user',
        firstName: 'Ivan',
        lastName: 'Ivanov',
        companyName: 'Test LLC',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      error: {
        statusCode: 401,
        message: 'Authentication required',
        error: 'Unauthorized'
      }
    },
    update: {
      success: {
        id: 1,
        email: 'test@example.com',
        role: 'user',
        firstName: 'Ivan',
        lastName: 'Petrov', // Updated surname
        companyName: 'Test LLC',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z'
      },
      error: {
        statusCode: 400,
        message: 'Invalid data format',
        error: 'Bad Request'
      }
    }
  }
};

// Function to simulate API delay
export const delayResponse = (data: any, delayMs = 300): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
};

// Function for mocking fetch requests
export const mockFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const { method = 'GET', headers = {}, body } = options;
  
  console.log(`Mocked fetch: ${method} ${url}`);
  
  // Parse URL to determine endpoint
  const endpoint = url.split('/').pop();
  const authHeader = headers['Authorization'] || '';
  const isAuthenticated = authHeader.includes('mock-token-123');
  
  // Handle different endpoints
  switch (true) {
    // Authentication
    case url.includes('/auth/login'):
      if (method === 'POST' && body) {
        const data = JSON.parse(body.toString());
        if (data.email === 'test@example.com' && data.password === 'password123') {
          return delayResponse(mockApiResponses.login.success).then(jsonResponse);
        }
      }
      return delayResponse(mockApiResponses.login.error, 500).then(errorResponse);
      
    case url.includes('/auth/register'):
      if (method === 'POST' && body) {
        const data = JSON.parse(body.toString());
        if (data.email === 'existing@example.com') {
          return delayResponse(mockApiResponses.register.error.conflict).then(errorResponse);
        }
        if (!data.termsAccepted) {
          return delayResponse(mockApiResponses.register.error.badRequest).then(errorResponse);
        }
        return delayResponse(mockApiResponses.register.success).then(jsonResponse);
      }
      return delayResponse(mockApiResponses.register.error.badRequest).then(errorResponse);
      
    // Legal consents
    case url.includes('/consents') && method === 'POST':
      if (!isAuthenticated) {
        return delayResponse({ statusCode: 401, message: 'Unauthorized' }, 100).then(errorResponse);
      }
      return delayResponse(mockApiResponses.consents.record.success).then(jsonResponse);
      
    case url.includes('/consents/status'):
      if (!isAuthenticated) {
        return delayResponse({ statusCode: 401, message: 'Unauthorized' }, 100).then(errorResponse);
      }
      if (url.includes('type=TERMS_OF_SERVICE')) {
        return delayResponse(mockApiResponses.consents.status.valid).then(jsonResponse);
      }
      return delayResponse(mockApiResponses.consents.status.invalid).then(jsonResponse);
      
    case url.includes('/consents/history'):
      if (!isAuthenticated) {
        return delayResponse({ statusCode: 401, message: 'Unauthorized' }, 100).then(errorResponse);
      }
      return delayResponse(mockApiResponses.consents.history.success).then(jsonResponse);
      
    // User profile
    case url.includes('/users/profile'):
      if (!isAuthenticated) {
        return delayResponse(mockApiResponses.userProfile.get.error, 100).then(errorResponse);
      }
      if (method === 'GET') {
        return delayResponse(mockApiResponses.userProfile.get.success).then(jsonResponse);
      }
      if (method === 'PATCH' && body) {
        const updatedData = {
          ...mockApiResponses.userProfile.get.success,
          ...JSON.parse(body.toString()),
          updatedAt: new Date().toISOString()
        };
        return delayResponse(updatedData).then(jsonResponse);
      }
      break;
      
    default:
      return delayResponse({
        statusCode: 404,
        message: 'Not found',
        error: 'Not Found'
      }, 100).then(errorResponse);
  }
  
  // If no case matched
  return delayResponse({
    statusCode: 500,
    message: 'Internal server error',
    error: 'Internal Server Error'
  }, 100).then(errorResponse);
};

// Helper functions for creating responses
function jsonResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

function errorResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: data.statusCode || 500
  });
}

// Export function to set up fetch mock in tests
export function setupMockFetch() {
  const originalFetch = global.fetch;
  global.fetch = vi.fn().mockImplementation(mockFetch);
  
  // Return cleanup function
  return () => {
    global.fetch = originalFetch;
  };
} 