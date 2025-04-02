import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DmcaReport } from '../../entities/dmca-report.entity';
import { CreateDmcaReportDto } from '../../dto/dmca-report.dto';
import { UpdateDmcaReportDto } from '../../dto/update-dmca-report.dto';
import { EmailService } from '../email.service';

@Injectable()
export class DmcaReportService {
  private readonly logger = new Logger(DmcaReportService.name);

  constructor(
    @InjectRepository(DmcaReport)
    private dmcaReportRepository: Repository<DmcaReport>,
    private emailService: EmailService
  ) {}

  /**
   * Создать новый DMCA отчет
   */
  async create(createDmcaReportDto: CreateDmcaReportDto): Promise<DmcaReport> {
    this.logger.log(`Creating DMCA report for content: ${createDmcaReportDto.contentUrl}`);
    
    const report = this.dmcaReportRepository.create(createDmcaReportDto);
    const savedReport = await this.dmcaReportRepository.save(report);
    
    try {
      // Уведомление администратора и пользователя
      await this.notifyAboutNewReport(savedReport);
    } catch (error) {
      this.logger.error(`Failed to send notifications for DMCA report #${savedReport.id}`, error);
    }
    
    return savedReport;
  }

  /**
   * Получить все DMCA отчеты
   */
  async findAll(): Promise<DmcaReport[]> {
    return this.dmcaReportRepository.find();
  }

  /**
   * Получить DMCA отчет по id
   */
  async findOne(id: string): Promise<DmcaReport> {
    return this.dmcaReportRepository.findOne({ where: { id } });
  }

  /**
   * Обновить статус DMCA отчета
   */
  async update(id: string, updateDmcaReportDto: UpdateDmcaReportDto): Promise<DmcaReport> {
    const report = await this.findOne(id);
    if (!report) {
      return null;
    }
    
    await this.dmcaReportRepository.update(id, updateDmcaReportDto);
    
    const updatedReport = await this.findOne(id);
    
    // Если статус изменился, отправляем уведомление
    if (updateDmcaReportDto.status && report.status !== updateDmcaReportDto.status) {
      try {
        await this.notifyAboutStatusChange(updatedReport);
      } catch (error) {
        this.logger.error(`Failed to send status update notification for DMCA report #${id}`, error);
      }
    }
    
    return updatedReport;
  }

  /**
   * Удалить DMCA отчет
   */
  async remove(id: string): Promise<void> {
    await this.dmcaReportRepository.delete(id);
  }

  /**
   * Отправить уведомления о новом DMCA отчете
   */
  private async notifyAboutNewReport(report: DmcaReport): Promise<void> {
    // Отправить администратору
    // TODO: Заменить на emailService.sendDmcaReportNotification()
    this.logger.log(`Would send notification to admin about new DMCA report #${report.id}`);
    
    // Отправить пользователю, чей контент был указан
    if (report.respondentEmail) {
      // TODO: Заменить на emailService.sendDmcaReportToRespondent()
      this.logger.log(`Would send notification to ${report.respondentEmail} about DMCA claim`);
    }
  }

  /**
   * Отправить уведомление об изменении статуса DMCA отчета
   */
  private async notifyAboutStatusChange(report: DmcaReport): Promise<void> {
    // Отправить заявителю
    // TODO: Заменить на emailService.sendDmcaStatusUpdateToClaimant()
    this.logger.log(`Would notify ${report.claimantEmail} about status change to ${report.status}`);
    
    // Отправить ответчику, если есть
    if (report.respondentEmail) {
      // TODO: Заменить на emailService.sendDmcaStatusUpdateToRespondent()
      this.logger.log(`Would notify ${report.respondentEmail} about status change to ${report.status}`);
    }
  }
}
