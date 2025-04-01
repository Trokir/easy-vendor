import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalConsentService } from '../../../services/legalConsent.service';
import { LegalConsent } from '../../../entities/legalConsent.entity';
import { User } from '../../../entities/user.entity';
import { EmailService } from '../../../services/email.service';

describe('LegalConsentService', () => {
  let service: LegalConsentService;
  let legalConsentRepository: Repository<LegalConsent>;
  let userRepository: Repository<User>;
  let emailService: EmailService;

  const mockLegalConsentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
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
          useValue: mockLegalConsentRepository,
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
    legalConsentRepository = module.get<Repository<LegalConsent>>(getRepositoryToken(LegalConsent));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recordConsent', () => {
    it('should create and save a new consent record and send email', async () => {
      const userId = 'test-user-id';
      const consentType = 'terms';
      const version = '1.0';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
      };
      const mockConsent = {
        id: 'test-id',
        userId,
        consentType,
        version,
        acceptedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockLegalConsentRepository.create.mockReturnValue(mockConsent);
      mockLegalConsentRepository.save.mockResolvedValue(mockConsent);

      const result = await service.recordConsent(userId, consentType, version);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockLegalConsentRepository.create).toHaveBeenCalledWith({
        userId,
        consentType,
        version,
        acceptedAt: expect.any(Date),
      });
      expect(mockLegalConsentRepository.save).toHaveBeenCalledWith(mockConsent);
      expect(mockEmailService.sendLegalConsentConfirmation).toHaveBeenCalledWith(
        mockUser.email,
        consentType,
        version,
        mockConsent.acceptedAt,
      );
      expect(result).toEqual(mockConsent);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.recordConsent('non-existent-id', 'terms', '1.0')
      ).rejects.toThrow('User not found');

      expect(mockLegalConsentRepository.create).not.toHaveBeenCalled();
      expect(mockLegalConsentRepository.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendLegalConsentConfirmation).not.toHaveBeenCalled();
    });

    it('should save consent even if email service fails', async () => {
      const userId = 'test-user-id';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
      };
      const mockConsent = {
        id: 'test-id',
        userId,
        consentType: 'terms',
        version: '1.0',
        acceptedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockLegalConsentRepository.create.mockReturnValue(mockConsent);
      mockLegalConsentRepository.save.mockResolvedValue(mockConsent);
      mockEmailService.sendLegalConsentConfirmation.mockImplementationOnce(() => {
        throw new Error('Email error');
      });

      const result = await service.recordConsent(userId, 'terms', '1.0');

      expect(result).toEqual(mockConsent);
      expect(mockEmailService.sendLegalConsentConfirmation).toHaveBeenCalled();
      expect(mockLegalConsentRepository.save).toHaveBeenCalled();
    });
  });

  describe('hasValidConsent', () => {
    it('should return false when no consent exists', async () => {
      mockLegalConsentRepository.findOne.mockResolvedValue(null);

      const result = await service.hasValidConsent('test-user-id');

      expect(result).toBe(false);
    });

    it('should return true for valid consent', async () => {
      const mockConsent = {
        id: 'test-id',
        userId: 'test-user-id',
        consentType: 'terms',
        version: '1.0',
        acceptedAt: new Date(),
      };

      mockLegalConsentRepository.findOne.mockResolvedValue(mockConsent);

      const result = await service.hasValidConsent('test-user-id');

      expect(result).toBe(true);
    });

    it('should return false for expired consent', async () => {
      const mockConsent = {
        id: 'test-id',
        userId: 'test-user-id',
        consentType: 'terms',
        version: '1.0',
        acceptedAt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), // 2 years ago
      };

      mockLegalConsentRepository.findOne.mockResolvedValue(mockConsent);

      const result = await service.hasValidConsent('test-user-id');

      expect(result).toBe(false);
    });
  });

  describe('getConsentHistory', () => {
    it('should return all consents for a user', async () => {
      const userId = 'test-user-id';
      const mockConsents = [
        {
          id: 'test-id-1',
          userId,
          consentType: 'terms',
          version: '1.0',
          acceptedAt: new Date(),
        },
        {
          id: 'test-id-2',
          userId,
          consentType: 'privacy',
          version: '1.0',
          acceptedAt: new Date(),
        },
      ];

      mockLegalConsentRepository.find.mockResolvedValue(mockConsents);

      const result = await service.getConsentHistory(userId);

      expect(mockLegalConsentRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { acceptedAt: 'DESC' },
      });
      expect(result).toEqual(mockConsents);
    });
  });
}); 