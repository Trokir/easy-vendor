import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { LegalConsentService } from '../../../services/legalConsent.service';
import { LegalConsent } from '../../../entities/legal-consent.entity';
import { User } from '../../../entities/user.entity';
import { EmailService } from '../../../services/email.service';
import { ConsentType } from '../../../types/legal-consent';

// Мок для @sendgrid/mail
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

// Хелперы для создания мок-репозиториев
const createMockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
});

describe('LegalConsentService', () => {
  let service: LegalConsentService;
  let legalConsentRepository;
  let userRepository;
  let emailService;

  // Моковые данные пользователя с id типа number (как в User entity)
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    passwordHash: 'hash',
    role: 'user',
    vendors: [],
    consents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Моковые данные согласия с userId типа number (как в LegalConsent entity)
  const mockConsent: LegalConsent = {
    id: 'uuid-1',
    userId: 1, // userId должен быть number, как указано в entity
    consentType: ConsentType.TERMS_OF_SERVICE,
    version: '1.0',
    metadata: { ip: '127.0.0.1' },
    user: mockUser,
    acceptedAt: new Date(),
  };

  beforeEach(async () => {
    legalConsentRepository = createMockRepository();
    userRepository = createMockRepository();
    emailService = {
      sendLegalConsentConfirmation: jest.fn().mockResolvedValue(undefined)
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalConsentService,
        {
          provide: getRepositoryToken(LegalConsent),
          useValue: legalConsentRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
      ],
    }).compile();

    service = module.get<LegalConsentService>(LegalConsentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordConsent', () => {
    it('should create and save a new consent record and send email', async () => {
      // Arrange
      const userId = 1;
      const consentType = ConsentType.TERMS_OF_SERVICE;
      const version = '1.0';
      
      const mockUser = {
        id: userId,
        email: 'test@example.com',
      };
      
      const mockConsent = {
        id: 1,
        userId,
        consentType,
        version,
        acceptedAt: expect.any(Date),
        user: mockUser
      };
      
      userRepository.findOne.mockResolvedValue(mockUser);
      legalConsentRepository.create.mockReturnValue(mockConsent);
      legalConsentRepository.save.mockResolvedValue(mockConsent);
      
      // Act
      const result = await service.recordConsent(userId, consentType, version);
      
      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(legalConsentRepository.create).toHaveBeenCalled();
      expect(legalConsentRepository.save).toHaveBeenCalled();
      expect(emailService.sendLegalConsentConfirmation).toHaveBeenCalledWith(
        mockUser.email,
        consentType,
        version,
        expect.any(Date)
      );
      expect(result).toEqual(mockConsent);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const nonExistentId = 999;
      userRepository.findOne.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.recordConsent(nonExistentId, ConsentType.TERMS_OF_SERVICE, '1.0')).rejects.toThrow(
        NotFoundException
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: nonExistentId } });
    });

    it('should save consent even if email service fails', async () => {
      // Arrange
      const userId = 1;
      const consentType = ConsentType.TERMS_OF_SERVICE;
      const version = '1.0';
      
      const mockUser = {
        id: userId,
        email: 'test@example.com',
      };
      
      const mockConsent = {
        id: 1,
        userId,
        consentType,
        version,
        acceptedAt: expect.any(Date),
        user: mockUser
      };
      
      userRepository.findOne.mockResolvedValue(mockUser);
      legalConsentRepository.create.mockReturnValue(mockConsent);
      legalConsentRepository.save.mockResolvedValue(mockConsent);
      jest.spyOn(emailService, 'sendLegalConsentConfirmation').mockRejectedValue(new Error('Email error'));
      
      // Act
      const result = await service.recordConsent(userId, consentType, version);
      
      // Assert
      expect(legalConsentRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockConsent);
    });
  });

  describe('hasValidConsent', () => {
    it('should return false when no consent exists', async () => {
      // Arrange
      legalConsentRepository.findOne.mockResolvedValue(null);
      
      // Act
      const result = await service.hasValidConsent(1, ConsentType.TERMS_OF_SERVICE);
      
      // Assert
      expect(result).toBe(false);
    });

    it('should return true for valid consent', async () => {
      // Arrange
      const mockConsent = {
        id: 1,
        userId: 1,
        consentType: ConsentType.TERMS_OF_SERVICE,
        version: '1.0',
        acceptedAt: new Date(),
        user: { id: 1, email: 'test@example.com' }
      };
      
      legalConsentRepository.findOne.mockResolvedValue(mockConsent);
      
      // Act
      const result = await service.hasValidConsent(1, ConsentType.TERMS_OF_SERVICE);
      
      // Assert
      expect(result).toBe(true);
    });

    it('should return false for expired consent', async () => {
      // Arrange
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Установим дату на год назад
      
      const mockConsent = {
        id: 1,
        userId: 1,
        consentType: ConsentType.TERMS_OF_SERVICE,
        version: '1.0',
        acceptedAt: oneYearAgo,
        user: { id: 1, email: 'test@example.com' }
      };
      
      legalConsentRepository.findOne.mockResolvedValue(mockConsent);
      
      // Act
      const result = await service.hasValidConsent(1, ConsentType.TERMS_OF_SERVICE);
      
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getConsentHistory', () => {
    it('should return all consents for a user', async () => {
      // Arrange
      const mockConsents = [
        {
          id: 1,
          userId: 1,
          consentType: ConsentType.TERMS_OF_SERVICE,
          version: '1.0',
          acceptedAt: new Date(),
          user: { id: 1, email: 'test@example.com' }
        },
        {
          id: 2,
          userId: 1,
          consentType: ConsentType.PRIVACY_POLICY,
          version: '1.0',
          acceptedAt: new Date(),
          user: { id: 1, email: 'test@example.com' }
        }
      ];
      
      legalConsentRepository.find.mockResolvedValue(mockConsents);
      
      // Act
      const result = await service.getConsentHistory(1);
      
      // Assert
      expect(legalConsentRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { acceptedAt: 'DESC' },
      });
      expect(result).toEqual(mockConsents);
    });

    it('should return empty array when no consents found', async () => {
      // Arrange
      legalConsentRepository.find.mockResolvedValue([]);
      
      // Act
      const result = await service.getConsentHistory(1);
      
      // Assert
      expect(result).toEqual([]);
    });
  });
});
