import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DmcaReportController } from './dmca-report.controller';
import { DmcaReportService } from '../services/dmca-report.service';
import { CreateDmcaReportDto, DmcaReportStatus, UpdateDmcaReportDto } from '../dto/dmca-report.dto';
import { DmcaReport } from '../entities/dmca-report.entity';

describe('DmcaReportController', () => {
  let controller: DmcaReportController;
  let service: DmcaReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DmcaReportController],
      providers: [
        {
          provide: DmcaReportService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DmcaReportController>(DmcaReportController);
    service = module.get<DmcaReportService>(DmcaReportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a DMCA report', async () => {
      // Arrange
      const createDto: CreateDmcaReportDto = {
        contentUrl: 'http://example.com',
        claimantName: 'John Doe',
        claimantEmail: 'john@example.com',
        originalWorkUrl: 'http://original.com',
        description: 'Copyright violation',
        isSwornStatement: true
      };

      const mockReport: DmcaReport = {
        id: '1',
        ...createDto,
        status: DmcaReportStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockReport);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockReport);
    });
  });

  describe('findAll', () => {
    it('should return an array of DMCA reports', async () => {
      // Arrange
      const mockReports: DmcaReport[] = [
        {
          id: '1',
          claimantName: 'John Doe',
          claimantEmail: 'john@example.com',
          contentUrl: 'http://example.com',
          originalWorkUrl: 'http://original.com',
          description: 'Copyright violation',
          isSwornStatement: true,
          status: DmcaReportStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockReports);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockReports);
    });
  });

  describe('findOne', () => {
    it('should return a DMCA report', async () => {
      // Arrange
      const id = '1';
      const mockReport: DmcaReport = {
        id,
        claimantName: 'John Doe',
        claimantEmail: 'john@example.com',
        contentUrl: 'http://example.com',
        originalWorkUrl: 'http://original.com',
        description: 'Copyright violation',
        isSwornStatement: true,
        status: DmcaReportStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockReport);

      // Act
      const result = await controller.findOne(id);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockReport);
    });

    it('should throw NotFoundException if report not found', async () => {
      // Arrange
      const id = '999';
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.findOne(id)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update a DMCA report', async () => {
      // Arrange
      const id = '1';
      const updateDto: UpdateDmcaReportDto = {
        status: DmcaReportStatus.VALID,
        adminNotes: 'Approved after review',
      };

      const updatedReport: DmcaReport = {
        id,
        claimantName: 'John Doe',
        claimantEmail: 'john@example.com',
        contentUrl: 'http://example.com',
        originalWorkUrl: 'http://original.com',
        description: 'Copyright violation',
        isSwornStatement: true,
        status: updateDto.status,
        adminNotes: updateDto.adminNotes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedReport);

      // Act
      const result = await controller.update(id, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(updatedReport);
    });

    it('should throw NotFoundException if report not found', async () => {
      // Arrange
      const id = '999';
      const updateDto: UpdateDmcaReportDto = {
        status: DmcaReportStatus.VALID,
      };

      jest.spyOn(service, 'update').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.update(id, updateDto)).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should delete a DMCA report', async () => {
      // Arrange
      const id = '1';
      const mockReport: DmcaReport = {
        id,
        claimantName: 'John Doe',
        claimantEmail: 'john@example.com',
        contentUrl: 'http://example.com',
        originalWorkUrl: 'http://original.com',
        description: 'Copyright violation',
        isSwornStatement: true,
        status: DmcaReportStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockReport);
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      // Act
      await controller.remove(id);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if report not found', async () => {
      // Arrange
      const id = '999';
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.remove(id)).rejects.toThrow(HttpException);
    });
  });
});
