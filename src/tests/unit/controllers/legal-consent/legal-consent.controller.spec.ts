import { Test, TestingModule } from '@nestjs/testing';
import { LegalConsentController } from '../../../../controllers/legal-consent/legal-consent.controller';
import { LegalConsentService } from '../../../../services/legal-consent/legal-consent.service';
import { CreateConsentDto } from '../../../../services/legal-consent/legal-consent.types';

describe('LegalConsentController', () => {
  let controller: LegalConsentController;
  let service: LegalConsentService;

  const mockLegalConsentService = {
    recordConsent: jest.fn(),
    getConsentHistory: jest.fn(),
    hasValidConsent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalConsentController],
      providers: [
        {
          provide: LegalConsentService,
          useValue: mockLegalConsentService,
        },
      ],
    }).compile();

    controller = module.get<LegalConsentController>(LegalConsentController);
    service = module.get<LegalConsentService>(LegalConsentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createConsent', () => {
    it('should create a new consent', async () => {
      const createConsentDto: CreateConsentDto = {
        userId: 'test-user-id',
        consentType: 'terms',
        version: '1.0',
        metadata: { ip: '127.0.0.1' },
      };

      const mockConsent = {
        id: 'test-id',
        ...createConsentDto,
        acceptedAt: new Date(),
      };

      mockLegalConsentService.recordConsent.mockResolvedValue(mockConsent);

      const result = await controller.createConsent(createConsentDto);

      expect(mockLegalConsentService.recordConsent).toHaveBeenCalledWith(
        createConsentDto.userId,
        createConsentDto.consentType,
        createConsentDto.version,
        createConsentDto.metadata,
      );
      expect(result).toEqual(mockConsent);
    });
  });

  describe('getConsentHistory', () => {
    it('should return consent history for a user', async () => {
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

      mockLegalConsentService.getConsentHistory.mockResolvedValue(mockConsents);

      const result = await controller.getConsentHistory(userId);

      expect(mockLegalConsentService.getConsentHistory).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockConsents);
    });
  });

  describe('checkConsentValidity', () => {
    it('should return consent validity status', async () => {
      const userId = 'test-user-id';
      const consentType = 'terms';
      const version = '1.0';

      mockLegalConsentService.hasValidConsent.mockResolvedValue(true);

      const result = await controller.checkConsentValidity(userId, consentType, version);

      expect(mockLegalConsentService.hasValidConsent).toHaveBeenCalledWith(
        userId,
        consentType,
        version,
      );
      expect(result).toEqual({ isValid: true });
    });
  });
}); 