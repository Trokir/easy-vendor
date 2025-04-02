import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { LegalConsentService } from '../../../../services/legalConsent.service';
import { LegalConsent } from '../../../../entities/legal-consent.entity';
import { User } from '../../../../entities/user.entity';
import { EmailService } from '../../../../services/email.service';
import { ConsentType } from '../../../../types/legal-consent';

describe('LegalConsentService', () => {
  let service: LegalConsentService;
  let repository: Repository<LegalConsent>;
  let userRepository: Repository<User>;
  let emailService: EmailService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    orderBy: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockEmailService = {
    sendLegalConsentConfirmation: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalConsentService,
        {
          provide: getRepositoryToken(LegalConsent),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<LegalConsentService>(LegalConsentService);
    repository = module.get<Repository<LegalConsent>>(getRepositoryToken(LegalConsent));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordConsent', () => {
    it('should create and save a new consent record', async () => {
      const userId = 1;
      const consentType = ConsentType.TERMS_OF_SERVICE;
      const version = '1.0';
      const metadata = { ip: '127.0.0.1' };

      const mockUser = {
        id: userId,
        email: 'test@example.com',
      };

      const mockConsent = {
        id: 'test-id',
        userId,
        consentType,
        version,
        metadata,
        acceptedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.create.mockReturnValue(mockConsent);
      mockRepository.save.mockResolvedValue(mockConsent);

      const result = await service.recordConsent(userId, consentType, version, metadata);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        consentType,
        version,
        metadata,
        acceptedAt: expect.any(Date),
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockConsent);
      expect(result).toEqual(mockConsent);
    });

    it('should throw error when user not found', async () => {
      const nonExistentId = 999;
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.recordConsent(nonExistentId, ConsentType.TERMS_OF_SERVICE, '1.0')).rejects.toThrow(
        NotFoundException
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendLegalConsentConfirmation).not.toHaveBeenCalled();
    });

    it('should save consent even if email service fails', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'test@example.com',
      };
      const mockConsent = {
        id: 'test-id',
        userId,
        consentType: ConsentType.TERMS_OF_SERVICE,
        version: '1.0',
        acceptedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.create.mockReturnValue(mockConsent);
      mockRepository.save.mockResolvedValue(mockConsent);
      mockEmailService.sendLegalConsentConfirmation.mockImplementationOnce(() => {
        throw new Error('Email error');
      });

      const result = await service.recordConsent(userId, ConsentType.TERMS_OF_SERVICE, '1.0');

      expect(result).toEqual(mockConsent);
      expect(mockEmailService.sendLegalConsentConfirmation).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('getConsentHistory', () => {
    it('should return consent history for a user', async () => {
      const userId = 1;
      const mockConsents = [
        {
          id: 'test-id-1',
          userId,
          consentType: ConsentType.TERMS_OF_SERVICE,
          version: '1.0',
          acceptedAt: new Date(),
        },
        {
          id: 'test-id-2',
          userId,
          consentType: ConsentType.PRIVACY_POLICY,
          version: '1.0',
          acceptedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockConsents);

      const result = await service.getConsentHistory(userId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { acceptedAt: 'DESC' },
      });
      expect(result).toEqual(mockConsents);
    });
  });

  describe('hasValidConsent', () => {
    it('should return true when user has valid consent', async () => {
      const userId = 1;
      const consentType = ConsentType.TERMS_OF_SERVICE;
      const version = '1.0';

      const mockConsent = {
        id: 'test-id',
        userId,
        consentType,
        version,
        acceptedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockConsent);

      const result = await service.hasValidConsent(userId, consentType, version);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId,
          consentType,
          version,
        },
        order: { acceptedAt: 'DESC' },
      });
      expect(result).toBe(true);
    });

    it('should return false when user has no valid consent', async () => {
      const userId = 1;
      const consentType = ConsentType.TERMS_OF_SERVICE;
      const version = '1.0';

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.hasValidConsent(userId, consentType, version);

      expect(result).toBe(false);
    });
  });
});
