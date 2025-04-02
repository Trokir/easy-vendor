import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CCPAService } from './ccpaService';
import { UserPrivacyPreference } from '../../entities/UserPrivacyPreference';

// Мок для MailService
const mockMailService = {
  sendCCPAOptOutConfirmation: jest.fn(),
  sendDataDeletionConfirmation: jest.fn(),
};

describe('CCPAService', () => {
  let service: CCPAService;
  let repository: Repository<UserPrivacyPreference>;
  let mailService: any;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CCPAService,
        {
          provide: getRepositoryToken(UserPrivacyPreference),
          useValue: mockRepository,
        },
        {
          provide: 'MailService',
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<CCPAService>(CCPAService);
    repository = module.get<Repository<UserPrivacyPreference>>(getRepositoryToken(UserPrivacyPreference));
    mailService = module.get<any>('MailService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setOptOut', () => {
    it('creates a new record if it does not exist', async () => {
      const userId = 1;
      const optOut = true;
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        userId,
        ccpaOptOut: optOut,
        optOutDate: expect.any(Date),
      });

      await service.setOptOut(userId, optOut);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        ccpaOptOut: optOut,
        optOutDate: expect.any(Date),
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockMailService.sendCCPAOptOutConfirmation).toHaveBeenCalledWith(userId);
    });

    it('updates existing record', async () => {
      const userId = 1;
      const optOut = true;
      const existingPreference = {
        userId,
        ccpaOptOut: false,
        optOutDate: null,
      };
      mockRepository.findOne.mockResolvedValue(existingPreference);

      await service.setOptOut(userId, optOut);

      expect(existingPreference.ccpaOptOut).toBe(optOut);
      expect(existingPreference.optOutDate).toBeInstanceOf(Date);
      expect(mockRepository.save).toHaveBeenCalledWith(existingPreference);
      expect(mockMailService.sendCCPAOptOutConfirmation).toHaveBeenCalledWith(userId);
    });
  });

  describe('getOptOutStatus', () => {
    it('returns false if record not found', async () => {
      const userId = 1;
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getOptOutStatus(userId);

      expect(result).toBe(false);
    });

    it('returns status from existing record', async () => {
      const userId = 1;
      const existingPreference = {
        userId,
        ccpaOptOut: true,
      };
      mockRepository.findOne.mockResolvedValue(existingPreference);

      const result = await service.getOptOutStatus(userId);

      expect(result).toBe(true);
    });
  });

  describe('requestDataDeletion', () => {
    it('creates a new record with data deletion request', async () => {
      const userId = 1;
      const reason = 'Test reason';
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        userId,
        dataDeleteRequested: true,
        deleteRequestDate: expect.any(Date),
      });

      const requestId = await service.requestDataDeletion(userId, reason);

      expect(requestId).toMatch(/^DEL-\d+-[a-z0-9]{9}$/);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockMailService.sendDataDeletionConfirmation).toHaveBeenCalledWith(userId, requestId);
    });

    it('updates existing record with data deletion request', async () => {
      const userId = 1;
      const existingPreference = {
        userId,
        dataDeleteRequested: false,
        deleteRequestDate: null,
      };
      mockRepository.findOne.mockResolvedValue(existingPreference);

      const requestId = await service.requestDataDeletion(userId);

      expect(existingPreference.dataDeleteRequested).toBe(true);
      expect(existingPreference.deleteRequestDate).toBeInstanceOf(Date);
      expect(mockRepository.save).toHaveBeenCalledWith(existingPreference);
      expect(mockMailService.sendDataDeletionConfirmation).toHaveBeenCalledWith(userId, requestId);
    });
  });

  describe('getDataCategories', () => {
    it('returns data categories', async () => {
      const result = await service.getDataCategories();

      expect(result).toEqual({
        collected: expect.any(Array),
        sold: expect.any(Array),
        disclosed: expect.any(Array),
      });
      expect(result.collected).toContain('Identifying information');
      expect(result.sold).toContain('Advertising networks');
      expect(result.disclosed).toContain('Service providers');
    });
  });
}); 