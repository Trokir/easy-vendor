import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalConsentService } from './legal-consent.service';
import { LegalConsent } from '../entities/legal-consent.entity';
import { NotFoundException } from '@nestjs/common';
import { addDays } from 'date-fns';

describe('LegalConsentService', () => {
  let service: LegalConsentService;
  let legalConsentRepository: Repository<LegalConsent>;

  const mockLegalConsentRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalConsentService,
        {
          provide: getRepositoryToken(LegalConsent),
          useValue: mockLegalConsentRepository,
        },
      ],
    }).compile();

    service = module.get<LegalConsentService>(LegalConsentService);
    legalConsentRepository = module.get<Repository<LegalConsent>>(getRepositoryToken(LegalConsent));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordConsent', () => {
    const recordConsentDto = {
      userId: 1,
      type: 'terms',
      version: '1.0',
      metadata: { browser: 'Chrome' },
    };

    it('should successfully record consent', async () => {
      await service.recordConsent(recordConsentDto, '127.0.0.1');

      expect(mockLegalConsentRepository.save).toHaveBeenCalledWith({
        userId: recordConsentDto.userId,
        documentType: recordConsentDto.type,
        version: recordConsentDto.version,
        ip: '127.0.0.1',
        metadata: recordConsentDto.metadata,
      });
    });
  });

  describe('getConsentStatus', () => {
    const userId = 1;
    const type = 'terms';

    it('should return valid consent status', async () => {
      const acceptedAt = new Date();
      const mockConsent = {
        id: 1,
        userId,
        documentType: type,
        version: '1.0',
        acceptedAt,
        ip: '127.0.0.1',
      };

      mockLegalConsentRepository.findOne.mockResolvedValue(mockConsent);

      const result = await service.getConsentStatus(userId, type);

      expect(result).toEqual({
        isValid: true,
        version: mockConsent.version,
        acceptedAt: mockConsent.acceptedAt,
        expiresAt: addDays(mockConsent.acceptedAt, 365),
        ip: mockConsent.ip,
      });
    });

    it('should throw NotFoundException if consent not found', async () => {
      mockLegalConsentRepository.findOne.mockResolvedValue(null);

      await expect(service.getConsentStatus(userId, type)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConsentHistory', () => {
    const userId = 1;
    const mockConsents = [
      {
        id: 1,
        userId,
        documentType: 'terms',
        version: '1.0',
        acceptedAt: new Date(),
        ip: '127.0.0.1',
        metadata: { browser: 'Chrome' },
      },
    ];

    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    beforeEach(() => {
      mockLegalConsentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
    });

    it('should return consent history without type filter', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockConsents);

      const result = await service.getConsentHistory(userId);

      expect(result).toEqual(
        mockConsents.map(consent => ({
          type: consent.documentType,
          version: consent.version,
          acceptedAt: consent.acceptedAt,
          ip: consent.ip,
          metadata: consent.metadata,
        })),
      );
    });

    it('should return filtered consent history with type', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockConsents);

      const result = await service.getConsentHistory(userId, 'terms');

      expect(result).toEqual(
        mockConsents.map(consent => ({
          type: consent.documentType,
          version: consent.version,
          acceptedAt: consent.acceptedAt,
          ip: consent.ip,
          metadata: consent.metadata,
        })),
      );
    });
  });
}); 