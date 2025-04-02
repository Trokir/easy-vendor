import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { LegalConsentService } from '../../src/services/legalConsent.service';
import { LegalConsent } from '../../src/entities/legalConsent.entity';
import { User } from '../../src/entities/user.entity';
import { EmailService } from '../../src/services/email.service';
import { createMockRepository, createMockConfigService, createMockEmailService } from '../../src/utils/typeorm-test-utils';

describe('LegalConsentService', () => {
  let service: LegalConsentService;
  let legalConsentRepository: jest.Mocked<Repository<LegalConsent>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let emailService: jest.Mocked<EmailService>;
  let configService: jest.Mocked<ConfigService>;

  const testUser = { 
    id: 1, 
    email: 'test@example.com', 
    firstName: 'Test',
    lastName: 'User'
  } as User;

  const testConsent = { 
    id: 1, 
    user: testUser, 
    userId: 1,
    consentType: 'gdpr',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    createdAt: new Date(),
    version: '1.0'
  } as LegalConsent;

  beforeEach(async () => {
    // Создаем моки для репозиториев и сервисов
    legalConsentRepository = createMockRepository<LegalConsent>();
    userRepository = createMockRepository<User>();
    emailService = createMockEmailService();
    configService = createMockConfigService();

    // Настраиваем поведение моков
    userRepository.findOne.mockResolvedValue(testUser);
    legalConsentRepository.findOne.mockResolvedValue(testConsent);
    legalConsentRepository.find.mockResolvedValue([testConsent]);
    legalConsentRepository.save.mockImplementation((entity) => {
      return Promise.resolve({
        id: 1,
        ...entity,
        createdAt: new Date()
      } as LegalConsent);
    });

    // Создаем тестовый модуль
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalConsentService,
        {
          provide: getRepositoryToken(LegalConsent),
          useValue: legalConsentRepository
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository
        },
        {
          provide: EmailService,
          useValue: emailService
        },
        {
          provide: ConfigService,
          useValue: configService
        }
      ],
    }).compile();

    service = module.get<LegalConsentService>(LegalConsentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordConsent', () => {
    it('should record new consent and return it', async () => {
      const consentData = {
        userId: 1,
        consentType: 'gdpr',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        version: '1.0'
      };

      const result = await service.recordConsent(consentData);

      expect(result).toBeDefined();
      expect(result.userId).toBe(consentData.userId);
      expect(result.consentType).toBe(consentData.consentType);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: consentData.userId }
      });
      expect(legalConsentRepository.save).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);

      const consentData = {
        userId: 999,
        consentType: 'gdpr',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        version: '1.0'
      };

      await expect(service.recordConsent(consentData)).rejects.toThrow();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: consentData.userId }
      });
      expect(legalConsentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('hasValidConsent', () => {
    it('should return true when user has valid consent', async () => {
      const result = await service.hasValidConsent(1, 'gdpr');

      expect(result).toBe(true);
      expect(legalConsentRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 1,
          consentType: 'gdpr'
        },
        order: { createdAt: 'DESC' }
      });
    });

    it('should return false when user has no consent', async () => {
      legalConsentRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.hasValidConsent(1, 'gdpr');

      expect(result).toBe(false);
      expect(legalConsentRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 1,
          consentType: 'gdpr'
        },
        order: { createdAt: 'DESC' }
      });
    });
  });

  describe('getConsentHistory', () => {
    it('should return consent history for a user', async () => {
      const result = await service.getConsentHistory(1, 'gdpr');

      expect(result).toEqual([testConsent]);
      expect(legalConsentRepository.find).toHaveBeenCalledWith({
        where: {
          userId: 1,
          consentType: 'gdpr'
        },
        order: { createdAt: 'DESC' }
      });
    });

    it('should return empty array when no consent history found', async () => {
      legalConsentRepository.find.mockResolvedValueOnce([]);

      const result = await service.getConsentHistory(999, 'gdpr');

      expect(result).toEqual([]);
      expect(legalConsentRepository.find).toHaveBeenCalledWith({
        where: {
          userId: 999,
          consentType: 'gdpr'
        },
        order: { createdAt: 'DESC' }
      });
    });
  });
}); 