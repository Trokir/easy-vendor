import { Test, TestingModule } from '@nestjs/testing';
import { CCPAController } from './ccpaController';
import { CCPAService } from '../../services/privacy/ccpaService';

describe('CCPAController', () => {
  let controller: CCPAController;
  let service: CCPAService;

  const mockCCPAService = {
    setOptOut: jest.fn(),
    getOptOutStatus: jest.fn(),
    requestDataDeletion: jest.fn(),
    getDataCategories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CCPAController],
      providers: [
        {
          provide: CCPAService,
          useValue: mockCCPAService,
        },
      ],
    }).compile();

    controller = module.get<CCPAController>(CCPAController);
    service = module.get<CCPAService>(CCPAService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setOptOut', () => {
    it('calls service to set opt-out', async () => {
      const userId = 1;
      await controller.setOptOut(userId);

      expect(mockCCPAService.setOptOut).toHaveBeenCalledWith(userId, true);
    });
  });

  describe('getOptOutStatus', () => {
    it('returns opt-out status', async () => {
      const userId = 1;
      const mockStatus = { optedOut: true };
      mockCCPAService.getOptOutStatus.mockResolvedValue(true);

      const result = await controller.getOptOutStatus(userId);

      expect(mockCCPAService.getOptOutStatus).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockStatus);
    });
  });

  describe('requestDataDeletion', () => {
    it('creates data deletion request', async () => {
      const userId = 1;
      const reason = 'Test reason';
      const mockRequestId = 'DEL-123456789';
      mockCCPAService.requestDataDeletion.mockResolvedValue(mockRequestId);

      const result = await controller.requestDataDeletion(userId, reason);

      expect(mockCCPAService.requestDataDeletion).toHaveBeenCalledWith(userId, reason);
      expect(result).toEqual({ requestId: mockRequestId });
    });

    it('creates data deletion request without reason', async () => {
      const userId = 1;
      const mockRequestId = 'DEL-123456789';
      mockCCPAService.requestDataDeletion.mockResolvedValue(mockRequestId);

      const result = await controller.requestDataDeletion(userId);

      expect(mockCCPAService.requestDataDeletion).toHaveBeenCalledWith(userId, undefined);
      expect(result).toEqual({ requestId: mockRequestId });
    });
  });

  describe('getDataCategories', () => {
    it('returns data categories', async () => {
      const mockCategories = {
        collected: ['Identification information'],
        sold: ['Advertising networks'],
        disclosed: ['Service providers'],
      };
      mockCCPAService.getDataCategories.mockResolvedValue(mockCategories);

      const result = await controller.getDataCategories();

      expect(mockCCPAService.getDataCategories).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });
}); 