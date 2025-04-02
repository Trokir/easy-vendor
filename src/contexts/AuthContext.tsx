import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthService } from './ServiceContext';

// User interface
export interface User {
  id: number;
  email: string;
  role: string;
  [key: string]: any;
}

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Authentication context interface
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create context with default values
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

// Hook for using authentication context
export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};

// Authentication context provider
interface AuthProviderProps {
  children: ReactNode;
  initialAuthState?: Partial<AuthState>;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children,
  initialAuthState = {} 
}) => {
  // Get authentication service
  const authService = useAuthService();
  
  // Authentication state
  const [state, setState] = useState<AuthState>({
    ...initialState,
    ...initialAuthState,
  });

  // Check token on component load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setState(prev => ({ ...prev, loading: true }));
      
      authService.validateToken(token)
        .then(isValid => {
          if (isValid) {
            // If token is valid, get user information
            return authService.getCurrentUser()
              .then(user => {
                setState({
                  isAuthenticated: true,
                  user,
                  token,
                  loading: false,
                  error: null,
                });
              });
          } else {
            // If token is invalid, clear localStorage
            localStorage.removeItem('token');
            setState({
              ...initialState,
              loading: false,
            });
          }
        })
        .catch(error => {
          localStorage.removeItem('token');
          setState({
            ...initialState,
            loading: false,
            error: error.message,
          });
        });
    }
  }, [authService]);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authService.login(email, password);
      
      // Save token to localStorage
      localStorage.setItem('token', response.accessToken);
      
      setState({
        isAuthenticated: true,
        user: response.user,
        token: response.accessToken,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error logging in' 
      }));
      throw error;
    }
  };

  // Registration function
  const register = async (data: any): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.register(data);
      
      // After successful registration, perform login
      const loginResponse = await authService.login(data.email, data.password);
      
      // Save token to localStorage
      localStorage.setItem('token', loginResponse.accessToken);
      
      setState({
        isAuthenticated: true,
        user: loginResponse.user,
        token: loginResponse.accessToken,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error during registration' 
      }));
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('token');
    setState(initialState);
  };

  // Function to clear errors
  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 