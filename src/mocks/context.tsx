// src/mocks/context.tsx
import React, { ReactNode } from 'react';
import { authServiceMock, legalConsentServiceMock, userServiceMock } from './services';

// Определение типов для контекстов
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  register: (userData: any) => Promise<any>;
}

interface LegalConsentContextType {
  recordConsent: (userId: number, consentType: string, version: string) => Promise<any>;
  hasValidConsent: (userId: number, consentType: string) => Promise<boolean>;
  getConsentHistory: (userId: number) => Promise<any[]>;
}

interface UserContextType {
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
  updateProfile: (data: any) => Promise<any>;
}

// Создание контекстов
export const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => Promise.resolve(null),
  logout: () => {},
  register: () => Promise.resolve(null)
});

export const LegalConsentContext = React.createContext<LegalConsentContextType>({
  recordConsent: () => Promise.resolve(null),
  hasValidConsent: () => Promise.resolve(false),
  getConsentHistory: () => Promise.resolve([])
});

export const UserContext = React.createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  updateProfile: () => Promise.resolve(null)
});

// Провайдеры контекстов для тестирования
export const MockAuthProvider: React.FC<{
  children: ReactNode;
  initialAuth?: Partial<AuthContextType>;
}> = ({ children, initialAuth = {} }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    initialAuth.isAuthenticated || false
  );
  const [user, setUser] = React.useState(initialAuth.user || null);

  const login = async (email: string, password: string) => {
    try {
      const result = await authServiceMock.login(email, password);
      setIsAuthenticated(true);
      setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async (userData: any) => {
    try {
      const result = await authServiceMock.register(userData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    register,
    ...initialAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const MockLegalConsentProvider: React.FC<{
  children: ReactNode;
  initialState?: Partial<LegalConsentContextType>;
}> = ({ children, initialState = {} }) => {
  const recordConsent = async (userId: number, consentType: string, version: string) => {
    return legalConsentServiceMock.recordConsent(userId, consentType, version);
  };

  const hasValidConsent = async (userId: number, consentType: string) => {
    return legalConsentServiceMock.hasValidConsent(userId, consentType);
  };

  const getConsentHistory = async (userId: number) => {
    return legalConsentServiceMock.getConsentHistory(userId);
  };

  const value = {
    recordConsent,
    hasValidConsent,
    getConsentHistory,
    ...initialState
  };

  return <LegalConsentContext.Provider value={value}>{children}</LegalConsentContext.Provider>;
};

export const MockUserProvider: React.FC<{
  children: ReactNode;
  initialState?: Partial<UserContextType>;
}> = ({ children, initialState = {} }) => {
  const [currentUser, setCurrentUser] = React.useState(initialState.currentUser || null);

  const updateProfile = async (data: any) => {
    try {
      const updatedUser = await userServiceMock.update(currentUser?.id, data);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    updateProfile,
    ...initialState
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Комбинированный провайдер для предоставления всех контекстов
export const MockAllProviders: React.FC<{
  children: ReactNode;
  initialAuth?: Partial<AuthContextType>;
  initialLegalConsent?: Partial<LegalConsentContextType>;
  initialUser?: Partial<UserContextType>;
}> = ({
  children,
  initialAuth = {},
  initialLegalConsent = {},
  initialUser = {}
}) => {
  return (
    <MockAuthProvider initialAuth={initialAuth}>
      <MockLegalConsentProvider initialState={initialLegalConsent}>
        <MockUserProvider initialState={initialUser}>
          {children}
        </MockUserProvider>
      </MockLegalConsentProvider>
    </MockAuthProvider>
  );
}; 