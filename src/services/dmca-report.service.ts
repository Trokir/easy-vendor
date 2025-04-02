import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DmcaReport } from '../entities/dmca-report.entity';
import { CreateDmcaReportDto, DmcaReportStatus, UpdateDmcaReportDto } from '../dto/dmca-report.dto';

@Injectable()
export class DmcaReportService {
  constructor(
    @InjectRepository(DmcaReport)
    private dmcaReportRepository: Repository<DmcaReport>
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

  async update(id: string, updateDmcaReportDto: UpdateDmcaReportDto): Promise<DmcaReport> {
    const report = await this.findOne(id);
    
    if (!report) {
      return null;
    }
    
    // Обновляем только те поля, которые присутствуют в DTO
    if (updateDmcaReportDto.status) {
      report.status = updateDmcaReportDto.status;
    }
    
    if (updateDmcaReportDto.adminNotes !== undefined) {
      report.adminNotes = updateDmcaReportDto.adminNotes;
    }
    
    if (updateDmcaReportDto.assignedTo !== undefined) {
      report.assignedTo = updateDmcaReportDto.assignedTo;
    }

    return this.dmcaReportRepository.save(report);
  }

  async remove(id: string): Promise<void> {
    await this.dmcaReportRepository.delete(id);
  }
}
