// src/mocks/mockServices.ts
// Моки для бэкенд-сервисов, используемые только в тестах
// Импортируйте этот файл только в тестовых файлах

import { vi } from 'vitest';

// Типы для моков
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

// Мок для AuthService
export const authServiceMock = {
  login: vi.fn().mockImplementation((email: string, password: string) => {
    if (email === 'test@example.com' && password === 'password123') {
      return Promise.resolve({
        accessToken: 'mock-token-123',
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    return Promise.reject(new Error('Неверный email или пароль'));
  }),
  
  register: vi.fn().mockImplementation((dto: any) => {
    if (dto.email === 'existing@example.com') {
      return Promise.reject(new Error('Пользователь с таким email уже существует'));
    }
    return Promise.resolve({
      id: 2,
      email: dto.email,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }),
  
  validateToken: vi.fn().mockImplementation((token: string) => {
    if (token === 'mock-token-123') {
      return Promise.resolve(true);
    }
    return Promise.reject(new Error('Недействительный токен'));
  }),
  
  getCurrentUser: vi.fn().mockImplementation(() => {
    return Promise.resolve({
      id: 1,
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  })
};

// Мок для LegalConsentService
export const legalConsentServiceMock = {
  recordConsent: vi.fn().mockImplementation((userId: number, consentType: string, version: string) => {
    return Promise.resolve({
      id: 1,
      userId,
      consentType,
      version,
      timestamp: new Date(),
      ipAddress: '127.0.0.1'
    });
  }),
  
  hasValidConsent: vi.fn().mockImplementation((userId: number, consentType: string) => {
    // Имитируем ситуацию, когда у пользователя с ID=1 есть согласие на условия использования
    if (userId === 1 && consentType === 'TERMS_OF_SERVICE') {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }),
  
  getConsentHistory: vi.fn().mockImplementation((userId: number) => {
    return Promise.resolve([
      {
        id: 1,
        userId,
        consentType: 'TERMS_OF_SERVICE',
        version: '1.0',
        timestamp: new Date(Date.now() - 86400000), // Вчера
        ipAddress: '127.0.0.1'
      },
      {
        id: 2,
        userId,
        consentType: 'PRIVACY_POLICY',
        version: '1.1',
        timestamp: new Date(), // Сегодня
        ipAddress: '127.0.0.1'
      }
    ]);
  })
};

// Мок для UserService
export const userServiceMock = {
  findAll: vi.fn().mockResolvedValue([
    { id: 1, email: 'test@example.com', role: 'user' },
    { id: 2, email: 'admin@example.com', role: 'admin' }
  ] as User[]),
  
  findById: vi.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return Promise.reject(new Error('Пользователь не найден'));
  }),
  
  findByEmail: vi.fn().mockImplementation((email: string) => {
    if (email === 'test@example.com') {
      return Promise.resolve({
        id: 1,
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return Promise.reject(new Error('Пользователь не найден'));
  }),
  
  update: vi.fn().mockImplementation((id: number, data: any) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        email: 'test@example.com',
        ...data,
        updatedAt: new Date()
      });
    }
    return Promise.reject(new Error('Пользователь не найден'));
  }),
  
  remove: vi.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve(true);
    }
    return Promise.reject(new Error('Пользователь не найден'));
  })
};

// Мок для EmailService
export const emailServiceMock = {
  sendLegalConsentConfirmation: vi.fn().mockImplementation(() => {
    return Promise.resolve({ success: true });
  })
};

// Экспорт всех моков для удобного доступа
export const serviceMocks = {
  authService: authServiceMock,
  legalConsentService: legalConsentServiceMock,
  userService: userServiceMock,
  emailService: emailServiceMock
}; 