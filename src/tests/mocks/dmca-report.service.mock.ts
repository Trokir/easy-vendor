import { Injectable } from '@nestjs/common';
import { DmcaReportService } from '../../services/dmca-report.service';
import { DmcaReport } from '../../entities/dmca-report.entity';
import { CreateDmcaReportDto, DmcaReportStatus, UpdateDmcaReportDto } from '../../dto/dmca-report.dto';

@Injectable()
export class MockDmcaReportService extends DmcaReportService {
  private reports: DmcaReport[] = [];

  async create(createDmcaReportDto: CreateDmcaReportDto): Promise<DmcaReport> {
    const report = {
      id: Math.random().toString(36).substr(2, 9),
      ...createDmcaReportDto,
      status: DmcaReportStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as DmcaReport;

    this.reports.push(report);
    return report;
  }

  async findAll(): Promise<DmcaReport[]> {
    return this.reports;
  }

  async findOne(id: string): Promise<DmcaReport | null> {
    return this.reports.find(report => report.id === id) || null;
  }

  async update(id: string, updateDmcaReportDto: UpdateDmcaReportDto): Promise<DmcaReport | null> {
    const index = this.reports.findIndex(report => report.id === id);
    if (index === -1) return null;

    const report = this.reports[index];
    
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

    report.updatedAt = new Date();
    return report;
  }

  async remove(id: string): Promise<void> {
    const index = this.reports.findIndex(report => report.id === id);
    if (index !== -1) {
      this.reports.splice(index, 1);
    }
  }

  async updateStatus(id: string, status: DmcaReportStatus): Promise<DmcaReport | null> {
    return this.update(id, { status });
  }

  async assignTo(id: string, adminId: string): Promise<DmcaReport | null> {
    return this.update(id, { assignedTo: adminId });
  }

  async addAdminNotes(id: string, notes: string): Promise<DmcaReport | null> {
    return this.update(id, { adminNotes: notes });
  }
} 