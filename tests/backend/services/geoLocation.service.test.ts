import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeoLocationService, PrivacyLegislation } from '../../../src/services/geoLocation.service';

describe('GeoLocationService', () => {
  // Mock for localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  // Mock for fetch API
  const fetchMock = vi.fn();

  beforeEach(() => {
    // Set mocks
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    global.fetch = fetchMock;
    
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Tests for isCaliforniaUser
  describe('isCaliforniaUser', () => {
    it('should use localStorage cache if available', async () => {
      // Setup localStorage with California = true
      localStorageMock.getItem.mockReturnValue('true');
      
      const result = await GeoLocationService.isCaliforniaUser();
      
      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('is_california_user');
      // Fetch should not be called since we had a cached value
      expect(fetchMock).not.toHaveBeenCalled();
    });
    
    it('should return true for California users based on geolocation', async () => {
      // Setup localStorage without cached value
      localStorageMock.getItem.mockReturnValue(null);
      
      // Mock response for a California user
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          country: { iso_code: 'US' },
          subdivisions: [{ iso_code: 'CA' }]
        })
      });
      
      const result = await GeoLocationService.isCaliforniaUser();
      
      expect(result).toBe(true);
      // Value should be stored in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('is_california_user', 'true');
    });
    
    it('should return false for non-California US users', async () => {
      // Setup localStorage without cached value
      localStorageMock.getItem.mockReturnValue(null);
      
      // Mock response for a user in NY
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          country: { iso_code: 'US' },
          subdivisions: [{ iso_code: 'NY' }]
        })
      });
      
      const result = await GeoLocationService.isCaliforniaUser();
      
      expect(result).toBe(false);
      // Result should be cached
      expect(localStorageMock.setItem).toHaveBeenCalledWith('is_california_user', 'false');
    });
    
    it('should return false for non-US users', async () => {
      // Setup localStorage without cached value
      localStorageMock.getItem.mockReturnValue(null);
      
      // Mock response for a user outside US
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          country: { iso_code: 'UK' },
          subdivisions: []
        })
      });
      
      const result = await GeoLocationService.isCaliforniaUser();
      
      expect(result).toBe(false);
      // Result should be cached
      expect(localStorageMock.setItem).toHaveBeenCalledWith('is_california_user', 'false');
    });
  });

  // Tests for getApplicableLegislation
  describe('getApplicableLegislation', () => {
    it('should return CCPA as the default legislation', async () => {
      const result = await GeoLocationService.getApplicableLegislation();
      expect(result).toBe(PrivacyLegislation.CCPA);
    });
  });

  // Tests for getUserLocation
  describe('getUserLocation', () => {
    it('should return location data for the user', async () => {
      // Mock successful API response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          country: { iso_code: 'US' },
          subdivisions: [{ iso_code: 'CA' }],
          city: { names: { en: 'San Francisco' } },
          postal: { code: '94105' },
          location: { time_zone: 'America/Los_Angeles' },
          traits: { ip_address: '192.168.1.1' }
        })
      });

      const result = await GeoLocationService.getUserLocation();
      
      expect(result).toEqual({
        country: 'US',
        region: 'CA',
        city: 'San Francisco',
        postalCode: '94105',
        timezone: 'America/Los_Angeles',
        ip: '192.168.1.1'
      });
    });
  });

  // Tests for getUserState with caching
  describe('getUserState', () => {
    it('should return cached region if available', async () => {
      // Setup localStorage with cached region
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        region: 'CA',
        timestamp: Date.now()
      }));
      
      const result = await GeoLocationService.getUserState();
      
      expect(result).toBe('CA');
      // Should not call API since we have a cache
      expect(fetchMock).not.toHaveBeenCalled();
    });
    
    it('should fetch region data if no cache is available', async () => {
      // Mock fetch response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ region: 'CA' })
      });
      
      const result = await GeoLocationService.getUserState();
      
      expect(result).toBe('CA');
      expect(fetchMock).toHaveBeenCalledWith(GeoLocationService['API_URL']);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
    
    it('should invalidate expired cache and fetch new data', async () => {
      // Setup expired cache
      const expiredTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
        region: 'VA',
        timestamp: expiredTimestamp
      }));
      
      // Mock fetch response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ region: 'CA' })
      });
      
      const result = await GeoLocationService.getUserState();
      
      expect(result).toBe('CA');
      expect(fetchMock).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalled(); // Clear old cache
      expect(localStorageMock.setItem).toHaveBeenCalled(); // Set new cache
    });
    
    it('should handle fetch errors', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress logging
      
      // Mock fetch error
      fetchMock.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await GeoLocationService.getUserState();
      
      expect(result).toBe('');
    });
    
    it('should handle invalid response data', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress logging
      
      // Mock invalid response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ region: null }) // Missing region
      });
      
      const result = await GeoLocationService.getUserState();
      
      expect(result).toBe('');
    });
    
    it('should handle non-OK response', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {}); // Suppress logging
      
      // Mock error response
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      const result = await GeoLocationService.getUserState();
      
      expect(result).toBe('');
    });
  });

  // Tests for clearCache
  describe('clearCache', () => {
    it('should clear region cache from localStorage', () => {
      GeoLocationService.clearCache();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(GeoLocationService['CACHE_KEY']);
    });
  });
}); 