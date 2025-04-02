import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { createMockRepository, mockConfigService } from '../../mocks/repositories';
import { User } from '../../entities/user.entity';
import { Vendor } from '../../entities/vendor.entity';
import { LegalConsent } from '../../entities/legal-consent.entity';
import { DmcaReport } from '../../entities/dmca-report.entity';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { EmailService } from '../../services/email.service';
import { LegalConsentService } from '../../services/legalConsent.service';
import { DmcaReportService } from '../../services/dmca-report.service';

// Мок для jwt
import * as jwt from 'jsonwebtoken';
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'valid.token') {
      return { sub: 1, email: 'test@example.com' };
    }
    throw new Error('Invalid token');
  })
}));

export interface TestServiceModuleParams {
  providers?: any[];
  repositories?: Record<string, Partial<Repository<any>>>;
  configValues?: Record<string, any>;
}

/**
 * Создает тестовый модуль для сервисов с настроенными моками репозиториев
 */
export const createTestServiceModule = async ({
  providers = [],
  repositories = {},
  configValues = {},
}: TestServiceModuleParams = {}): Promise<TestingModule> => {
  // Основные моки репозиториев
  const mockRepositories: Record<string, any> = {
    [getRepositoryToken(User) as string]: createMockRepository(),
    [getRepositoryToken(Vendor) as string]: createMockRepository(),
    [getRepositoryToken(LegalConsent) as string]: createMockRepository(),
    [getRepositoryToken(DmcaReport) as string]: createMockRepository(),
    ...repositories
  };

  // Настраиваем ConfigService с предоставленными значениями
  const configServiceMock = {
    ...mockConfigService,
    get: jest.fn().mockImplementation((key: string) => {
      return configValues[key] || mockConfigService.get(key);
    }),
  };

  const module = await Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: ConfigService,
        useValue: configServiceMock,
      },
      ...Object.entries(mockRepositories).map(([token, repository]) => ({
        provide: token,
        useValue: repository,
      })),
    ],
  }).compile();

  return module;
};

/**
 * Создает тестовый модуль для AuthService со всеми зависимостями
 */
export const createAuthServiceTestModule = async (
  params: TestServiceModuleParams = {}
): Promise<TestingModule> => {
  return createTestServiceModule({
    providers: [AuthService, UserService, EmailService, LegalConsentService],
    configValues: {
      'JWT_SECRET': 'test-secret',
      'JWT_EXPIRATION': '1h',
    },
    ...params,
  });
};

/**
 * Создает тестовый модуль для UserService со всеми зависимостями
 */
export const createUserServiceTestModule = async (
  params: TestServiceModuleParams = {}
): Promise<TestingModule> => {
  return createTestServiceModule({
    providers: [UserService],
    ...params,
  });
};

/**
 * Создает тестовый модуль для LegalConsentService со всеми зависимостями
 */
export const createLegalConsentServiceTestModule = async (
  params: TestServiceModuleParams = {}
): Promise<TestingModule> => {
  return createTestServiceModule({
    providers: [LegalConsentService, UserService, EmailService],
    ...params,
  });
};

/**
 * Создает тестовый модуль для DmcaReportService со всеми зависимостями
 */
export const createDmcaReportServiceTestModule = async (
  params: TestServiceModuleParams = {}
): Promise<TestingModule> => {
  return createTestServiceModule({
    providers: [DmcaReportService],
    ...params,
  });
};

/**
 * Создает тестовый модуль для EmailService со всеми зависимостями
 */
export const createEmailServiceTestModule = async (
  params: TestServiceModuleParams = {}
): Promise<TestingModule> => {
  return createTestServiceModule({
    providers: [EmailService],
    configValues: {
      'SENDGRID_API_KEY': 'test-api-key',
      'SENDGRID_FROM_EMAIL': 'test@example.com',
      'SENDGRID_TERMS_TEMPLATE_ID': 'terms-template-id',
      'SENDGRID_PRIVACY_TEMPLATE_ID': 'privacy-template-id', 
      'SENDGRID_COOKIES_TEMPLATE_ID': 'cookies-template-id',
    },
    ...params,
  });
}; 