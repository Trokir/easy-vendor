import React, { createContext, useContext, ReactNode } from 'react';
import { services } from '../services/api';

// Интерфейсы для типизации сервисов
export interface AuthService {
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  validateToken: (token: string) => Promise<boolean>;
  getCurrentUser: () => Promise<any>;
}

export interface LegalConsentService {
  recordConsent: (userId: number, consentType: string, version: string, metadata?: any) => Promise<any>;
  hasValidConsent: (userId: number, consentType: string) => Promise<boolean>;
  getConsentHistory: (userId: number) => Promise<any[]>;
}

export interface UserService {
  findAll: () => Promise<any[]>;
  findById: (id: number) => Promise<any>;
  findByEmail: (email: string) => Promise<any>;
  update: (id: number, data: any) => Promise<any>;
  remove: (id: number) => Promise<boolean>;
}

export interface EmailService {
  sendLegalConsentConfirmation: (email: string, consentType: string, version: string, date: Date) => Promise<any>;
}

// Интерфейс для контекста сервисов
export interface ServiceContextType {
  authService: AuthService;
  legalConsentService: LegalConsentService;
  userService: UserService;
  emailService: EmailService;
}

// Создание контекста с реальными сервисами
export const ServiceContext = createContext<ServiceContextType>({
  authService: services.authService,
  legalConsentService: services.legalConsentService,
  userService: services.userService,
  emailService: services.emailService,
});

// Хук для использования сервисов
export const useServices = (): ServiceContextType => {
  return useContext(ServiceContext);
};

// Хуки для отдельных сервисов
export const useAuthService = (): AuthService => {
  const { authService } = useServices();
  return authService;
};

export const useLegalConsentService = (): LegalConsentService => {
  const { legalConsentService } = useServices();
  return legalConsentService;
};

export const useUserService = (): UserService => {
  const { userService } = useServices();
  return userService;
};

export const useEmailService = (): EmailService => {
  const { emailService } = useServices();
  return emailService;
};

// Провайдер контекста
interface ServiceProviderProps {
  children: ReactNode;
  services?: Partial<ServiceContextType>;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ 
  children,
  services: customServices = {}
}) => {
  // Объединяем переданные сервисы с реальными сервисами по умолчанию
  const contextValue: ServiceContextType = {
    authService: customServices.authService || services.authService,
    legalConsentService: customServices.legalConsentService || services.legalConsentService,
    userService: customServices.userService || services.userService,
    emailService: customServices.emailService || services.emailService,
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
};

export default ServiceProvider; 