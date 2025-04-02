import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DmcaReportService } from './dmca-report.service';
import { DmcaReport } from '../entities/dmca-report.entity';
import { CreateDmcaReportDto, DmcaReportStatus, UpdateDmcaReportDto } from '../dto/dmca-report.dto';

describe('DmcaReportService', () => {
  let service: DmcaReportService;
  let repository: Repository<DmcaReport>;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DmcaReportService,
        {
          provide: getRepositoryToken(DmcaReport),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DmcaReportService>(DmcaReportService);
    repository = module.get<Repository<DmcaReport>>(getRepositoryToken(DmcaReport));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a DMCA report', async () => {
      const createDto: CreateDmcaReportDto = {
        contentUrl: 'http://example.com',
        claimantName: 'John Doe',
        claimantEmail: 'john@example.com',
        originalWorkUrl: 'http://original.com',
        description: 'Copyright violation',
        isSwornStatement: true
      };

      const newReport = { id: '1', ...createDto };
      mockRepository.create.mockReturnValue(newReport);
      mockRepository.save.mockResolvedValue(newReport);

      const result = await service.create(createDto);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(newReport);
      expect(result).toEqual(newReport);
    });
  });

  describe('findAll', () => {
    it('should return an array of DMCA reports', async () => {
      const reports = [{ id: '1' }, { id: '2' }];
      mockRepository.find.mockResolvedValue(reports);

      const result = await service.findAll();
      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(reports);
    });
  });

  describe('findOne', () => {
    it('should return a DMCA report', async () => {
      const report = { id: '1' };
      mockRepository.findOne.mockResolvedValue(report);

      const result = await service.findOne('1');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(report);
    });
  });

  describe('update', () => {
    it('should update a DMCA report', async () => {
      const updateDto: UpdateDmcaReportDto = {
        status: DmcaReportStatus.VALID,
        adminNotes: 'Approved after review',
      };

      const existingReport = { 
        id: '1', 
        status: DmcaReportStatus.PENDING,
        adminNotes: ''
      };
      
      const updatedReport = { 
        ...existingReport, 
        ...updateDto 
      };
      
      mockRepository.findOne.mockResolvedValue(existingReport);
      mockRepository.save.mockResolvedValue(updatedReport);

      const result = await service.update('1', updateDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedReport);
    });

    it('should return null if report not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update('1', { status: DmcaReportStatus.VALID });
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a DMCA report', async () => {
      await service.remove('1');
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
