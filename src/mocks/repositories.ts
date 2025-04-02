import { Repository } from 'typeorm';

// Generic mock factory for TypeORM repositories
export const createMockRepository = <T = any>(): jest.Mocked<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  })),
  metadata: {
    columns: [],
    relations: [],
  },
  manager: {} as any,
} as unknown as jest.Mocked<Repository<T>>);

// Mock repositories for specific entities
export const mockUserRepository = createMockRepository();
export const mockVendorRepository = createMockRepository();
export const mockLegalConsentRepository = createMockRepository();
export const mockDmcaReportRepository = createMockRepository();
export const mockTokenRepository = createMockRepository();
export const mockNotificationRepository = createMockRepository();

// Mock config service
export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
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