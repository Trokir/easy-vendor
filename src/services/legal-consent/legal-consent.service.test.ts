import { LegalConsentService } from './legal-consent.service';
import { Repository } from 'typeorm';
import { ConsentType } from '../../types/consent.types';
import { LegalConsent } from '../../entities/legal-consent.entity';
import { User } from '../../entities/user.entity';
import { EmailService } from '../email.service';

describe('LegalConsentService', () => {
  let service: LegalConsentService;
  const mockFetch = jest.fn();
  global.fetch = mockFetch;
  
  // Создаем мок-репозитории и сервисы
  const mockLegalConsentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn()
  } as unknown as Repository<LegalConsent>;
  
  const mockUserRepository = {
    findOne: jest.fn()
  } as unknown as Repository<User>;
  
  const mockEmailService = {
    sendLegalConsentConfirmation: jest.fn()
  } as unknown as EmailService;

  beforeEach(() => {
    service = new LegalConsentService(
      mockLegalConsentRepository,
      mockUserRepository,
      mockEmailService
    );
    jest.clearAllMocks();
  });

  describe('checkConsent', () => {
    it('returns consent status when successful', async () => {
      const mockResponse = { accepted: true, timestamp: Date.now() };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.checkConsent(1, ConsentType.TERMS_OF_SERVICE, '1.0');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/legal-consent/check'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('1'),
        })
      );
    });

    it('throws error when request fails', async () => {
      const errorMessage = 'Network error';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.checkConsent(1, ConsentType.TERMS_OF_SERVICE, '1.0')).rejects.toThrow(errorMessage);
    });
  });

  describe('recordConsent', () => {
    it('records consent successfully', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const metadata = { timestamp: Date.now() };
      const result = await service.recordConsent(1, ConsentType.TERMS_OF_SERVICE, '1.0', metadata);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/legal-consent/record'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('1'),
        })
      );
    });

    it('throws error when request fails', async () => {
      const errorMessage = 'Server error';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.recordConsent(1, ConsentType.TERMS_OF_SERVICE, '1.0', {})).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe('getConsentHistory', () => {
    it('returns consent history when successful', async () => {
      const mockResponse = [
        { type: ConsentType.TERMS_OF_SERVICE, version: '1.0', accepted: true, timestamp: Date.now() },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.getConsentHistory(1);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/legal-consent/history'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('throws error when request fails', async () => {
      const errorMessage = 'Network error';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.getConsentHistory(1)).rejects.toThrow(errorMessage);
    });
  });

  describe('revokeConsent', () => {
    it('revokes consent successfully', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.revokeConsent(1, ConsentType.TERMS_OF_SERVICE, '1.0');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/legal-consent/revoke'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('1'),
        })
      );
    });

    it('throws error when request fails', async () => {
      const errorMessage = 'Server error';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.revokeConsent(1, ConsentType.TERMS_OF_SERVICE, '1.0')).rejects.toThrow(
        errorMessage
      );
    });
  });
});
