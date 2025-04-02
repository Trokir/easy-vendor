import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CCPAController } from '../../../../src/controllers/privacy/ccpaController';
import { CCPAService } from '../../../../src/services/privacy/ccpaService';

// Мокаем модули и зависимости
vi.mock('../../../../src/services/privacy/ccpaService', () => ({
  CCPAService: vi.fn().mockImplementation(() => ({
    setOptOut: vi.fn(),
    getOptOutStatus: vi.fn(),
    requestDataDeletion: vi.fn(),
    getDataCategories: vi.fn(),
  })),
}));

describe('CCPAController', () => {
  let ccpaController: CCPAController;
  let ccpaService: CCPAService;

  beforeEach(() => {
    // Очищаем все моки перед каждым тестом
    vi.clearAllMocks();
    
    // Создаем экземпляр сервиса
    ccpaService = new CCPAService(null, null);
    
    // Создаем экземпляр контроллера с моком сервиса
    ccpaController = new CCPAController(ccpaService);
  });

  describe('setOptOut', () => {
    it('should call ccpaService.setOptOut with correct parameters', async () => {
      // Arrange
      const userId = 123;
      vi.mocked(ccpaService.setOptOut).mockResolvedValueOnce(undefined);

      // Act
      await ccpaController.setOptOut(userId);

      // Assert
      expect(ccpaService.setOptOut).toHaveBeenCalledWith(userId, true);
      expect(ccpaService.setOptOut).toHaveBeenCalledTimes(1);
    });

    it('should handle errors properly', async () => {
      // Arrange
      const userId = 123;
      const error = new Error('Database error');
      vi.mocked(ccpaService.setOptOut).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(ccpaController.setOptOut(userId)).rejects.toThrow('Database error');
    });
  });

  describe('getOptOutStatus', () => {
    it('should return optedOut status from service', async () => {
      // Arrange
      const userId = 123;
      vi.mocked(ccpaService.getOptOutStatus).mockResolvedValueOnce(true);

      // Act
      const result = await ccpaController.getOptOutStatus(userId);

      // Assert
      expect(ccpaService.getOptOutStatus).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ optedOut: true });
    });

    it('should handle false status correctly', async () => {
      // Arrange
      const userId = 123;
      vi.mocked(ccpaService.getOptOutStatus).mockResolvedValueOnce(false);

      // Act
      const result = await ccpaController.getOptOutStatus(userId);

      // Assert
      expect(ccpaService.getOptOutStatus).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ optedOut: false });
    });
  });

  describe('requestDataDeletion', () => {
    it('should call service with userId and reason', async () => {
      // Arrange
      const userId = 123;
      const reason = 'No longer using the service';
      const requestId = 'DEL-12345';
      vi.mocked(ccpaService.requestDataDeletion).mockResolvedValueOnce(requestId);

      // Act
      const result = await ccpaController.requestDataDeletion(userId, reason);

      // Assert
      expect(ccpaService.requestDataDeletion).toHaveBeenCalledWith(userId, reason);
      expect(result).toEqual({ requestId });
    });

    it('should work without reason parameter', async () => {
      // Arrange
      const userId = 123;
      const requestId = 'DEL-12345';
      vi.mocked(ccpaService.requestDataDeletion).mockResolvedValueOnce(requestId);

      // Act
      const result = await ccpaController.requestDataDeletion(userId);

      // Assert
      expect(ccpaService.requestDataDeletion).toHaveBeenCalledWith(userId, undefined);
      expect(result).toEqual({ requestId });
    });
  });

  describe('getDataCategories', () => {
    it('should return data categories from service', async () => {
      // Arrange
      const mockCategories = {
        collected: ['Personal Info', 'Browsing History'],
        sold: ['Marketing Data'],
        disclosed: ['Service Providers']
      };
      vi.mocked(ccpaService.getDataCategories).mockResolvedValueOnce(mockCategories);

      // Act
      const result = await ccpaController.getDataCategories();

      // Assert
      expect(ccpaService.getDataCategories).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });
}); 