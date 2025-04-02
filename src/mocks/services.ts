// src/mocks/services.ts
// Простые реализации сервисов для использования в разработке

// Типы для сервисов
interface User {
  id: number;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginResponse {
  accessToken: string;
  user: User;
}

interface ConsentRecord {
  id: number;
  userId: number;
  consentType: string;
  version: string;
  acceptedAt: Date;
  ipAddress: string;
}

// Простая реализация AuthService
export const authServiceMock = {
  login: async (email: string, password: string) => {
    if (email === 'test@example.com' && password === 'password123') {
      return {
        accessToken: 'mock-token-123',
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      } as LoginResponse;
    }
    throw new Error('Неверные учетные данные');
  },
  
  register: async (dto: any) => {
    if (dto.email === 'existing@example.com') {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    if (!dto.termsAccepted) {
      throw new Error('Необходимо принять условия использования');
    }
    
    return {
      id: 2,
      email: dto.email,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;
  },
  
  validateToken: async (token: string) => {
    return token === 'mock-token-123';
  },
  
  getCurrentUser: async () => {
    return {
      id: 1,
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;
  }
};

// Простая реализация LegalConsentService
export const legalConsentServiceMock = {
  recordConsent: async (userId: number, consentType: string, version: string) => {
    return {
      id: 1,
      userId,
      consentType,
      version,
      acceptedAt: new Date(),
      ipAddress: '127.0.0.1'
    } as ConsentRecord;
  },
  
  hasValidConsent: async (userId: number, consentType: string) => {
    // Имитируем ситуацию, когда у пользователя с ID=1 есть согласие на условия использования
    return userId === 1 && consentType === 'TERMS_OF_SERVICE';
  },
  
  getConsentHistory: async (userId: number) => {
    return [
      {
        id: 1,
        userId,
        consentType: 'TERMS_OF_SERVICE',
        version: '1.0',
        acceptedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 дней назад
        ipAddress: '127.0.0.1'
      },
      {
        id: 2,
        userId,
        consentType: 'PRIVACY_POLICY',
        version: '1.1',
        acceptedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 дней назад
        ipAddress: '127.0.0.1'
      }
    ] as ConsentRecord[];
  }
};

// Простая реализация UserService
export const userServiceMock = {
  findAll: async () => {
    return [
      { id: 1, email: 'test@example.com', role: 'user' },
      { id: 2, email: 'admin@example.com', role: 'admin' }
    ] as User[];
  },
  
  findById: async (id: number) => {
    if (id === 1) {
      return {
        id: 1,
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;
    }
    throw new Error('Пользователь не найден');
  },
  
  findByEmail: async (email: string) => {
    if (email === 'test@example.com') {
      return {
        id: 1,
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;
    }
    return null;
  },
  
  update: async (id: number, data: any) => {
    if (id === 1) {
      return {
        id: 1,
        ...data,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;
    }
    throw new Error('Пользователь не найден');
  },
  
  remove: async (id: number) => {
    return id === 1;
  }
};

// Простая реализация EmailService
export const emailServiceMock = {
  sendLegalConsentConfirmation: async () => {
    return { success: true };
  }
};

// Экспорт всех сервисов
export const serviceMocks = {
  authService: authServiceMock,
  legalConsentService: legalConsentServiceMock,
  userService: userServiceMock,
  emailService: emailServiceMock
}; 