import { LegalConsentService } from './legal-consent.service';

describe('LegalConsentService', () => {
  let service: LegalConsentService;
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    service = new LegalConsentService();
    jest.clearAllMocks();
  });

  describe('checkConsent', () => {
    it('returns consent status when successful', async () => {
      const mockResponse = { accepted: true, timestamp: Date.now() };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.checkConsent('test-user', 'terms', '1.0');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/legal-consent/check'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test-user'),
        })
      );
    });

    it('throws error when request fails', async () => {
      const errorMessage = 'Network error';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.checkConsent('test-user', 'terms', '1.0'))
        .rejects
        .toThrow(errorMessage);
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
      const result = await service.recordConsent('test-user', 'terms', '1.0', metadata);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/legal-consent/record'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test-user'),
        })
      );
    });

    it('throws error when request fails', async () => {
      const errorMessage = 'Server error';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.recordConsent('test-user', 'terms', '1.0', {}))
        .rejects
        .toThrow(errorMessage);
    });
  });

  describe('getConsentHistory', () => {
    it('returns consent history when successful', async () => {
      const mockResponse = [
        { type: 'terms', version: '1.0', accepted: true, timestamp: Date.now() },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.getConsentHistory('test-user');
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

      await expect(service.getConsentHistory('test-user'))
        .rejects
        .toThrow(errorMessage);
    });
  });

  describe('revokeConsent', () => {
    it('revokes consent successfully', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.revokeConsent('test-user', 'terms', '1.0');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/legal-consent/revoke'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test-user'),
        })
      );
    });

    it('throws error when request fails', async () => {
      const errorMessage = 'Server error';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.revokeConsent('test-user', 'terms', '1.0'))
        .rejects
        .toThrow(errorMessage);
    });
  });
}); 