import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CCPAService } from '../../../../src/services/privacy/ccpaService';
import { Repository } from 'typeorm';
import { EmailService } from '../../../../src/services/email.service';
import { ConsentType } from '../../../../src/types/legal-consent';
import { UserPrivacyPreference } from '../../../../src/entities/UserPrivacyPreference';

// Mock the UserPrivacyPreference entity
vi.mock('../../../../src/entities/UserPrivacyPreference', () => ({
  UserPrivacyPreference: class UserPrivacyPreference {
    id: number;
    userId: number;
    ccpaOptOut: boolean;
    optOutDate: Date | null;
    dataDeleteRequested: boolean;
    deleteRequestDate: Date | null;
  },
}));

describe('CCPAService', () => {
  let ccpaService: CCPAService;
  let mockPrivacyPreferenceRepository: Repository<UserPrivacyPreference>;
  let mockEmailService: EmailService;

  beforeEach(() => {
    // Create mocks
    mockPrivacyPreferenceRepository = {
      findOne: vi.fn(),
      save: vi.fn(),
      create: vi.fn(),
    } as unknown as Repository<UserPrivacyPreference>;

    mockEmailService = {
      sendLegalConsentConfirmation: vi.fn().mockResolvedValue(undefined),
    } as unknown as EmailService;

    // Create service instance with mocks
    ccpaService = new CCPAService(
      mockPrivacyPreferenceRepository,
      mockEmailService
    );
  });

  describe('setOptOut', () => {
    it('should update existing preference when user has one', async () => {
      // Arrange
      const userId = 123;
      const existingPreference = {
        userId,
        ccpaOptOut: false,
      };
      
      vi.mocked(mockPrivacyPreferenceRepository.findOne).mockResolvedValue(existingPreference as any);
      vi.mocked(mockPrivacyPreferenceRepository.save).mockResolvedValue({ ...existingPreference, ccpaOptOut: true } as any);

      // Act
      await ccpaService.setOptOut(userId, true);

      // Assert
      expect(mockPrivacyPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockPrivacyPreferenceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          ccpaOptOut: true,
          optOutDate: expect.any(Date),
        })
      );
      expect(mockEmailService.sendLegalConsentConfirmation).toHaveBeenCalledWith(
        expect.any(String),
        ConsentType.PRIVACY_POLICY,
        '1.0',
        expect.any(Date)
      );
    });

    it('should create new preference when user has none', async () => {
      // Arrange
      const userId = 123;
      
      vi.mocked(mockPrivacyPreferenceRepository.findOne).mockResolvedValue(null);
      vi.mocked(mockPrivacyPreferenceRepository.create).mockReturnValue({
        userId,
        ccpaOptOut: true,
        optOutDate: expect.any(Date),
      } as any);
      vi.mocked(mockPrivacyPreferenceRepository.save).mockResolvedValue({
        userId,
        ccpaOptOut: true,
        optOutDate: expect.any(Date),
      } as any);

      // Act
      await ccpaService.setOptOut(userId, true);

      // Assert
      expect(mockPrivacyPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockPrivacyPreferenceRepository.create).toHaveBeenCalledWith({
        userId,
        ccpaOptOut: true,
        optOutDate: expect.any(Date),
      });
      expect(mockPrivacyPreferenceRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendLegalConsentConfirmation).toHaveBeenCalledWith(
        expect.any(String),
        ConsentType.PRIVACY_POLICY,
        '1.0',
        expect.any(Date)
      );
    });
  });

  describe('getOptOutStatus', () => {
    it('should return true when user has opted out', async () => {
      // Arrange
      const userId = 123;
      const existingPreference = {
        userId,
        ccpaOptOut: true,
      };
      
      vi.mocked(mockPrivacyPreferenceRepository.findOne).mockResolvedValue(existingPreference as any);

      // Act
      const result = await ccpaService.getOptOutStatus(userId);

      // Assert
      expect(result).toBe(true);
      expect(mockPrivacyPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return false when user has not opted out', async () => {
      // Arrange
      const userId = 123;
      const existingPreference = {
        userId,
        ccpaOptOut: false,
      };
      
      vi.mocked(mockPrivacyPreferenceRepository.findOne).mockResolvedValue(existingPreference as any);

      // Act
      const result = await ccpaService.getOptOutStatus(userId);

      // Assert
      expect(result).toBe(false);
      expect(mockPrivacyPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return false when user has no preferences', async () => {
      // Arrange
      const userId = 123;
      
      vi.mocked(mockPrivacyPreferenceRepository.findOne).mockResolvedValue(null);

      // Act
      const result = await ccpaService.getOptOutStatus(userId);

      // Assert
      expect(result).toBe(false);
      expect(mockPrivacyPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('getDataCategories', () => {
    it('should return predefined data categories', async () => {
      // Act
      const result = await ccpaService.getDataCategories();

      // Assert
      expect(result).toEqual({
        collected: expect.arrayContaining([
          'Identification information',
          'Purchase information',
          'Website interaction data',
          'Technical data',
        ]),
        sold: expect.arrayContaining([
          'Service providers',
          'Payment processors',
          'Delivery services',
        ]),
        disclosed: expect.arrayContaining([
          'Advertising networks',
          'Analytics services',
          'Marketing partners',
        ]),
      });
    });
  });
}); 