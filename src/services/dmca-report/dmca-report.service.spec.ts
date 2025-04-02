import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DmcaReportService } from './dmca-report.service';
import { EmailService } from '../email.service';
import { DmcaReport } from '../../entities/dmca-report.entity';
import { CreateDmcaReportDto, DmcaReportStatus } from '../../dto/dmca-report.dto';
import { createMockRepository, mockConfigService } from '../../utils/typeorm-test-utils';
import { ConfigService } from '@nestjs/config';

describe('DmcaReportService', () => {
  let service: DmcaReportService;
  let repository: Repository<DmcaReport>;
  let emailService: EmailService;

  beforeEach(async () => {
    // Создаем моки репозитория и EmailService
    const mockRepository = createMockRepository<DmcaReport>();
    
    const mockEmailService = {
      sendDmcaReportNotification: jest.fn().mockResolvedValue(undefined),
      sendDmcaReportToRespondent: jest.fn().mockResolvedValue(undefined),
      sendDmcaStatusUpdateToClaimant: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DmcaReportService,
        {
          provide: getRepositoryToken(DmcaReport),
          useValue: mockRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DmcaReportService>(DmcaReportService);
    repository = module.get<Repository<DmcaReport>>(getRepositoryToken(DmcaReport));
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a DMCA report', async () => {
      // Подготовка данных
      const createDto: CreateDmcaReportDto = {
        claimantName: 'John Doe',
        claimantEmail: 'john@example.com',
        contentUrl: 'https://example.com/content',
        originalWorkUrl: 'https://example.com/original',
        description: 'This is a copyright violation',
        isSwornStatement: true,
      };

      const savedReport = {
        id: 'test-id',
        ...createDto,
        status: DmcaReportStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Мокирование методов
      jest.spyOn(repository, 'create').mockReturnValue(savedReport as any);
      jest.spyOn(repository, 'save').mockResolvedValue(savedReport as any);

      // Вызов тестируемого метода
      const result = await service.create(createDto);

      // Проверка результатов
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(savedReport);
      expect(emailService.sendDmcaReportNotification).toHaveBeenCalledWith(savedReport);
      
      // Email не должен отправляться respondent, так как email не указан
      expect(emailService.sendDmcaReportToRespondent).not.toHaveBeenCalled();
    });

    it('should create a DMCA report and send notification to respondent if email is provided', async () => {
      // Подготовка данных
      const createDto: CreateDmcaReportDto = {
        claimantName: 'John Doe',
        claimantEmail: 'john@example.com',
        respondentEmail: 'respondent@example.com',
        contentUrl: 'https://example.com/content',
        originalWorkUrl: 'https://example.com/original',
        description: 'This is a copyright violation',
        isSwornStatement: true,
      };

      const savedReport = {
        id: 'test-id',
        ...createDto,
        status: DmcaReportStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Мокирование методов
      jest.spyOn(repository, 'create').mockReturnValue(savedReport as any);
      jest.spyOn(repository, 'save').mockResolvedValue(savedReport as any);

      // Вызов тестируемого метода
      const result = await service.create(createDto);

      // Проверка результатов
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(savedReport);
      expect(emailService.sendDmcaReportNotification).toHaveBeenCalledWith(savedReport);
      expect(emailService.sendDmcaReportToRespondent).toHaveBeenCalledWith(savedReport);
    });

    it('should send notification even if email service throws', async () => {
      // Подготовка данных
      const createDto: CreateDmcaReportDto = {
        claimantName: 'John Doe',
        claimantEmail: 'john@example.com',
        contentUrl: 'https://example.com/content',
        originalWorkUrl: 'https://example.com/original',
        description: 'This is a copyright violation',
        isSwornStatement: true,
      };

      const savedReport = {
        id: 'test-id',
        ...createDto,
        status: DmcaReportStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Мокирование методов
      jest.spyOn(repository, 'create').mockReturnValue(savedReport as any);
      jest.spyOn(repository, 'save').mockResolvedValue(savedReport as any);
      jest.spyOn(emailService, 'sendDmcaReportNotification').mockRejectedValue(new Error('Email error'));

      // Вызов тестируемого метода
      const result = await service.create(createDto);

      // Проверка результатов
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(savedReport);
      expect(emailService.sendDmcaReportNotification).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of DMCA reports', async () => {
      // Подготовка данных
      const mockReports = [
        {
          id: 'test-id-1',
          claimantName: 'John Doe',
          claimantEmail: 'john@example.com',
          contentUrl: 'https://example.com/content1',
          originalWorkUrl: 'https://example.com/original1',
          description: 'This is a copyright violation 1',
          isSwornStatement: true,
          status: DmcaReportStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'test-id-2',
          claimantName: 'Jane Smith',
          claimantEmail: 'jane@example.com',
          contentUrl: 'https://example.com/content2',
          originalWorkUrl: 'https://example.com/original2',
          description: 'This is a copyright violation 2',
          isSwornStatement: true,
          status: DmcaReportStatus.REVIEWING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Мокирование find
      jest.spyOn(repository, 'find').mockResolvedValue(mockReports as any);

      // Вызов тестируемого метода
      const result = await service.findAll();

      // Проверка результатов
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockReports);
    });
  });

  describe('findOne', () => {
    it('should return a DMCA report by id', async () => {
      // Подготовка данных
      const mockReport = {
        id: 'test-id',
        claimantName: 'John Doe',
        claimantEmail: 'john@example.com',
        contentUrl: 'https://example.com/content',
        originalWorkUrl: 'https://example.com/original',
        description: 'This is a copyright violation',
        isSwornStatement: true,
        status: DmcaReportStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Мокирование findOne
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockReport as any);

      // Вызов тестируемого метода
      const result = await service.findOne('test-id');

      // Проверка результатов
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(result).toEqual(mockReport);
    });
  });

  describe('update', () => {
    it('should update a DMCA report and send status update notification', async () => {
      // Подготовка данных
      const id = 'test-id';
      const updateDto = {
        status: DmcaReportStatus.VALID,
        adminNotes: 'Verified and approved',
      };

      const existingReport = {
        id,
        claimantName: 'John Doe',
        claimantEmail: 'john@example.com',
        contentUrl: 'https://example.com/content',
        originalWorkUrl: 'https://example.com/original',
        description: 'This is a copyright violation',
        isSwornStatement: true,
        status: DmcaReportStatus.REVIEWING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedReport = {
        ...existingReport,
        ...updateDto,
        updatedAt: new Date(),
      };

      // Мокирование методов
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingReport as any);
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(updatedReport as any);

      // Вызов тестируемого метода
      const result = await service.update(id, updateDto);

      // Проверка результатов
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(repository.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(updatedReport);
      expect(emailService.sendDmcaStatusUpdateToClaimant).toHaveBeenCalledWith(updatedReport);
    });

    it('should return null if report not found', async () => {
      // Подготовка данных
      const id = 'non-existent-id';
      const updateDto = {
        status: DmcaReportStatus.VALID,
      };

      // Мокирование методов
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      // Вызов тестируемого метода
      const result = await service.update(id, updateDto);

      // Проверка результатов
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
      expect(repository.update).not.toHaveBeenCalled();
      expect(emailService.sendDmcaStatusUpdateToClaimant).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a DMCA report', async () => {
      // Подготовка данных
      const id = 'test-id';

      // Мокирование методов
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

      // Вызов тестируемого метода
      await service.remove(id);

      // Проверка результатов
      expect(repository.delete).toHaveBeenCalledWith(id);
    });
  });
}); 