import React from 'react';
import { render, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from './AuthContext';
import { ServiceProvider } from './ServiceContext';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock for AuthService
jest.mock('./ServiceContext', () => {
  const authServiceMock = {
    login: jest.fn(),
    register: jest.fn(),
    validateToken: jest.fn(),
    getCurrentUser: jest.fn()
  };

  return {
    ...jest.requireActual('./ServiceContext'),
    useAuthService: () => authServiceMock
  };
});

// Helper function to wrap providers
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ServiceProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ServiceProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Reset mocks
    const { useAuthService } = require('./ServiceContext');
    const authService = useAuthService();
    authService.login.mockReset();
    authService.register.mockReset();
    authService.validateToken.mockReset();
    authService.getCurrentUser.mockReset();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.token).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should login user successfully', async () => {
    const { useAuthService } = require('./ServiceContext');
    const authService = useAuthService();
    
    const mockToken = 'mock-token';
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
    
    authService.login.mockResolvedValueOnce({ 
      accessToken: mockToken,
      user: mockUser 
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle login error', async () => {
    const { useAuthService } = require('./ServiceContext');
    const authService = useAuthService();
    
    const errorMessage = 'Invalid credentials';
    authService.login.mockRejectedValueOnce(new Error(errorMessage));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@example.com', 'wrong-password').catch(() => {});
    });
    
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'wrong-password');
    expect(localStorage.getItem('token')).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBe(null);
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should register user successfully', async () => {
    const { useAuthService } = require('./ServiceContext');
    const authService = useAuthService();
    
    const mockToken = 'mock-token';
    const mockUser = { id: 1, email: 'new@example.com', name: 'New User' };
    
    authService.register.mockResolvedValueOnce(mockUser);
    authService.login.mockResolvedValueOnce({ 
      accessToken: mockToken,
      user: mockUser 
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const userData = {
      email: 'new@example.com',
      password: 'password',
      name: 'New User'
    };
    
    await act(async () => {
      await result.current.register(userData);
    });
    
    expect(authService.register).toHaveBeenCalledWith(userData);
    expect(authService.login).toHaveBeenCalledWith('new@example.com', 'password');
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should logout user', async () => {
    // First login the user
    const { useAuthService } = require('./ServiceContext');
    const authService = useAuthService();
    
    const mockToken = 'mock-token';
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
    
    authService.login.mockResolvedValueOnce({ 
      accessToken: mockToken,
      user: mockUser 
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    // Then logout
    act(() => {
      result.current.logout();
    });
    
    expect(localStorage.getItem('token')).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBe(null);
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should validate token on initialization if present', async () => {
    const { useAuthService } = require('./ServiceContext');
    const authService = useAuthService();
    
    const mockToken = 'mock-token';
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
    
    localStorage.setItem('token', mockToken);
    authService.validateToken.mockResolvedValueOnce(true);
    authService.getCurrentUser.mockResolvedValueOnce(mockUser);
    
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    // Initially we should be in a loading state
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(authService.validateToken).toHaveBeenCalledWith(mockToken);
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should clear error when clearError is called', async () => {
    const { useAuthService } = require('./ServiceContext');
    const authService = useAuthService();
    
    const errorMessage = 'Invalid credentials';
    authService.login.mockRejectedValueOnce(new Error(errorMessage));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@example.com', 'wrong-password').catch(() => {});
    });
    
    expect(result.current.error).toBe(errorMessage);
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBe(null);
  });
}); 