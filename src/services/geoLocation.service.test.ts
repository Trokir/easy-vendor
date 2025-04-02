import { GeoLocationService } from './geoLocation.service';

describe('GeoLocationService', () => {
  let originalLocalStorage;
  let mockLocalStorage = {};

  beforeEach(() => {
    // Сохраняем оригинальный localStorage
    originalLocalStorage = global.localStorage;
    
    // Создаем мок для localStorage
    mockLocalStorage = {
      getItem: jest.fn(key => {
        if (key === 'user-region-cache') {
          return JSON.stringify({
            region: 'CA',
            timestamp: Date.now()
          });
        }
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    
    // Подменяем глобальный localStorage нашим моком
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    // Создаем мок для fetch
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ region: 'CA' })
      })
    );
  });

  afterEach(() => {
    // Восстанавливаем оригинальный localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
    
    jest.clearAllMocks();
  });

  describe('isCaliforniaUser', () => {
    it('should return true for California users', async () => {
      // Для этого теста очищаем кеш
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      
      const result = await GeoLocationService.isCaliforniaUser();
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('https://api.ipapi.com/json/');
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should return false for non-California users', async () => {
      // Для этого теста очищаем кеш и меняем регион
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      global.fetch = jest.fn().mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ region: 'NY' })
        })
      );

      const result = await GeoLocationService.isCaliforniaUser();
      expect(result).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith('https://api.ipapi.com/json/');
    });

    it('should use cached value if available', async () => {
      const result = await GeoLocationService.isCaliforniaUser();
      expect(result).toBe(true);
      // Verify that fetch was not called
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      // Для этого теста очищаем кеш и симулируем ошибку API
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));

      const result = await GeoLocationService.isCaliforniaUser();
      expect(result).toBe(false); // Default to false on error
    });

    it('should handle invalid API response', async () => {
      // Для этого теста очищаем кеш и отдаем невалидный ответ
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      global.fetch = jest.fn().mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ invalid: 'response' })
        })
      );

      const result = await GeoLocationService.isCaliforniaUser();
      expect(result).toBe(false); // Default to false on invalid response
    });
  });

  describe('clearCache', () => {
    it('should clear the region cache', () => {
      GeoLocationService.clearCache();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user-region-cache');
    });
  });
}); 