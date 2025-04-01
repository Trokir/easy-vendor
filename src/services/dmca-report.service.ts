import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DmcaReport } from '../entities/dmca-report.entity';
import { CreateDmcaReportDto, UpdateDmcaReportDto } from '../dto/dmca-report.dto';

@Injectable()
export class DmcaReportService {
  constructor(
    @InjectRepository(DmcaReport)
    private dmcaReportRepository: Repository<DmcaReport>,
  ) {}

  async create(createDmcaReportDto: CreateDmcaReportDto): Promise<DmcaReport> {
    const report = this.dmcaReportRepository.create(createDmcaReportDto);
    return this.dmcaReportRepository.save(report);
  }

  async findAll(): Promise<DmcaReport[]> {
    return this.dmcaReportRepository.find();
  }

  async findOne(id: string): Promise<DmcaReport> {
    return this.dmcaReportRepository.findOne({ where: { id } });
  }

  async process(id: string, updateDmcaReportDto: UpdateDmcaReportDto): Promise<DmcaReport> {
    const report = await this.findOne(id);
    if (!report) {
      throw new Error('DMCA report not found');
    }

    report.isProcessed = true;
    report.processedAt = new Date();
    report.processingNotes = updateDmcaReportDto.processingNotes;

    return this.dmcaReportRepository.save(report);
  }

  async remove(id: string): Promise<void> {
    await this.dmcaReportRepository.delete(id);
  }
} 