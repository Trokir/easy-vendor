import { Repository } from 'typeorm';
import { vi } from 'vitest';

// Generic mock factory for TypeORM repositories
export const createMockRepository = <T = any>() => ({
  find: vi.fn(),
  findOne: vi.fn(),
  findAndCount: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  remove: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  createQueryBuilder: vi.fn(() => ({
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orWhere: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    innerJoinAndSelect: vi.fn().mockReturnThis(),
    getOne: vi.fn(),
    getMany: vi.fn(),
    getManyAndCount: vi.fn(),
    getRawOne: vi.fn(),
    getRawMany: vi.fn(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    execute: vi.fn(),
  })),
  metadata: {
    columns: [],
    relations: [],
  },
  manager: {} as any,
});

// Mock repositories for specific entities
export const mockUserRepository = createMockRepository();
export const mockVendorRepository = createMockRepository();
export const mockLegalConsentRepository = createMockRepository();
export const mockDmcaReportRepository = createMockRepository();
export const mockTokenRepository = createMockRepository();
export const mockNotificationRepository = createMockRepository();

// Mock config service
export const mockConfigService = {
  get: vi.fn().mockImplementation((key: string) => {
    const config = {
      'SENDGRID_API_KEY': 'SG.mock-key',
      'SENDGRID_FROM_EMAIL': 'test@example.com',
      'SENDGRID_TERMS_TEMPLATE_ID': 'terms-template-id',
      'SENDGRID_PRIVACY_TEMPLATE_ID': 'privacy-template-id',
      'SENDGRID_COOKIES_TEMPLATE_ID': 'cookies-template-id',
      'JWT_SECRET': 'test-secret',
      'JWT_EXPIRATION': '1h',
      'FRONTEND_URL': 'http://localhost:3000',
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': 5432,
      'DATABASE_USERNAME': 'test',
      'DATABASE_PASSWORD': 'test',
      'DATABASE_NAME': 'test',
    };
    return config[key];
  }),
}; 