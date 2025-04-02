// src/mocks/mockServices.ts
// Моки для бэкенд-сервисов, используемые только в тестах
// Импортируйте этот файл только в тестовых файлах

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
  login: jest.fn().mockImplementation((email: string, password: string) => {
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
      } as LoginResponse);
    }
    return Promise.reject(new Error('Неверные учетные данные'));
  }),
  
  register: jest.fn().mockImplementation((dto: any) => {
    if (dto.email === 'existing@example.com') {
      return Promise.reject(new Error('Пользователь с таким email уже существует'));
    }
    
    if (!dto.termsAccepted) {
      return Promise.reject(new Error('Необходимо принять условия использования'));
    }
    
    return Promise.resolve({
      id: 2,
      email: dto.email,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    } as User);
  }),
  
  validateToken: jest.fn().mockImplementation((token: string) => {
    if (token === 'mock-token-123') {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }),
  
  getCurrentUser: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      id: 1,
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    } as User);
  })
};

// Мок для LegalConsentService
export const legalConsentServiceMock = {
  recordConsent: jest.fn().mockImplementation((userId: number, consentType: string, version: string) => {
    return Promise.resolve({
      id: 1,
      userId,
      consentType,
      version,
      acceptedAt: new Date(),
      ipAddress: '127.0.0.1'
    } as ConsentRecord);
  }),
  
  hasValidConsent: jest.fn().mockImplementation((userId: number, consentType: string) => {
    // Имитируем ситуацию, когда у пользователя с ID=1 есть согласие на условия использования
    if (userId === 1 && consentType === 'TERMS_OF_SERVICE') {
      return Promise.resolve(true);
    }
    // Для всех остальных случаев возвращаем false
    return Promise.resolve(false);
  }),
  
  getConsentHistory: jest.fn().mockImplementation((userId: number) => {
    return Promise.resolve([
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
    ] as ConsentRecord[]);
  })
};

// Мок для UserService
export const userServiceMock = {
  findAll: jest.fn().mockResolvedValue([
    { id: 1, email: 'test@example.com', role: 'user' },
    { id: 2, email: 'admin@example.com', role: 'admin' }
  ] as User[]),
  
  findById: jest.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      } as User);
    }
    return Promise.reject(new Error('Пользователь не найден'));
  }),
  
  findByEmail: jest.fn().mockImplementation((email: string) => {
    if (email === 'test@example.com') {
      return Promise.resolve({
        id: 1,
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      } as User);
    }
    return Promise.resolve(null);
  }),
  
  update: jest.fn().mockImplementation((id: number, data: any) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        ...data,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      } as User);
    }
    return Promise.reject(new Error('Пользователь не найден'));
  }),
  
  remove: jest.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  })
};

// Мок для EmailService
export const emailServiceMock = {
  sendLegalConsentConfirmation: jest.fn().mockImplementation(() => {
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