import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { ConsentType } from '../types/legal-consent';
import { DmcaReport } from '../entities/dmca-report.entity';
import { DmcaReportStatus } from '../dto/dmca-report.dto';

// Export interface and functions for working with templates
export interface EmailTemplateData {
  consentType: ConsentType;
  version: string;
  acceptedAt: string;
  userEmail: string;
  [key: string]: any;
}

// Get email subject based on consent type
export function getEmailSubject(consentType: ConsentType): string {
  switch (consentType) {
    case ConsentType.TERMS_OF_SERVICE:
      return 'Terms of Service Consent Confirmation';
    case ConsentType.PRIVACY_POLICY:
      return 'Privacy Policy Consent Confirmation';
    case ConsentType.COOKIE_POLICY:
      return 'Cookie Policy Consent Confirmation';
    default:
      return 'Legal Consent Confirmation';
  }
}

// Export interface and functions for working with templates
export type EmailTemplateId = string;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private initialized = false;

  constructor(private configService: ConfigService) {}

  private ensureInitialized(): void {
    if (!this.initialized) {
      SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
      this.initialized = true;
    }
  }

  /**
   * Отправляет подтверждение о согласии с юридическими документами
   * @param email Email пользователя
   * @param consentType Тип согласия
   * @param version Версия документа
   * @param acceptedAt Дата принятия
   */
  async sendLegalConsentConfirmation(
    email: string,
    consentType: ConsentType,
    version: string,
    acceptedAt: Date
  ): Promise<void> {
    this.ensureInitialized();

    const msg = {
      to: email,
      from: this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com',
      subject: `Legal Consent Confirmation - ${consentType}`,
      templateId: this.getTemplateId(consentType),
      dynamicTemplateData: {
        consentType,
        version,
        acceptedAt: acceptedAt.toISOString(),
        userEmail: email,
      },
    };

    try {
      await SendGrid.send(msg);
    } catch (error) {
      this.logger.error(`Failed to send consent confirmation email to ${email}:`, error);
    }
  }

  /**
   * Отправляет уведомление администратору о новом DMCA-отчете
   * @param report DMCA-отчет
   */
  async sendDmcaReportNotification(report: DmcaReport): Promise<void> {
    this.ensureInitialized();

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@example.com';

    const msg = {
      to: adminEmail,
      from: this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com',
      subject: `New DMCA Report Submitted - #${report.id}`,
      templateId: 'd-dmca-admin-notification', // ID шаблона в SendGrid
      dynamicTemplateData: {
        reportId: report.id,
        claimantName: report.claimantName,
        claimantEmail: report.claimantEmail,
        contentUrl: report.contentUrl,
        submittedAt: report.createdAt.toISOString(),
        adminDashboardUrl: `${this.configService.get<string>('APP_URL')}/admin/dmca/${report.id}`,
      },
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`DMCA report notification sent to admin for report #${report.id}`);
    } catch (error) {
      this.logger.error(`Failed to send DMCA report notification to admin for report #${report.id}:`, error);
    }
  }

  /**
   * Отправляет уведомление ответчику (владельцу контента) о DMCA-отчете
   * @param report DMCA-отчет
   */
  async sendDmcaReportToRespondent(report: DmcaReport): Promise<void> {
    if (!report.respondentEmail) {
      this.logger.warn(`Cannot send DMCA notice to respondent - no email provided for report #${report.id}`);
      return;
    }

    this.ensureInitialized();

    const msg = {
      to: report.respondentEmail,
      from: this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com',
      subject: `DMCA Takedown Notice - Content ID #${report.id}`,
      templateId: 'd-dmca-respondent-notification', // ID шаблона в SendGrid
      dynamicTemplateData: {
        reportId: report.id,
        contentUrl: report.contentUrl,
        originalWorkUrl: report.originalWorkUrl,
        description: report.description,
        submittedAt: report.createdAt.toISOString(),
        counterNoticeUrl: `${this.configService.get<string>('APP_URL')}/dmca/counter-notice/${report.id}`,
      },
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`DMCA notice sent to respondent (${report.respondentEmail}) for report #${report.id}`);
    } catch (error) {
      this.logger.error(`Failed to send DMCA notice to respondent for report #${report.id}:`, error);
    }
  }

  /**
   * Отправляет уведомление об изменении статуса DMCA-отчета заявителю
   * @param report DMCA-отчет
   */
  async sendDmcaStatusUpdateToClaimant(report: DmcaReport): Promise<void> {
    this.ensureInitialized();

    const statusMessages = {
      [DmcaReportStatus.PENDING]: 'Your DMCA report is pending review',
      [DmcaReportStatus.REVIEWING]: 'Your DMCA report is under review',
      [DmcaReportStatus.VALID]: 'Your DMCA report has been validated',
      [DmcaReportStatus.INVALID]: 'Your DMCA report has been marked as invalid',
      [DmcaReportStatus.COUNTER_NOTICE]: 'A counter notice has been filed for your DMCA report',
      [DmcaReportStatus.RESOLVED]: 'Your DMCA report has been resolved',
      [DmcaReportStatus.REJECTED]: 'Your DMCA report has been rejected',
    };

    const msg = {
      to: report.claimantEmail,
      from: this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com',
      subject: `DMCA Report Status Update - #${report.id}`,
      templateId: 'd-dmca-status-update', // ID шаблона в SendGrid
      dynamicTemplateData: {
        reportId: report.id,
        contentUrl: report.contentUrl,
        status: report.status,
        statusMessage: statusMessages[report.status],
        updatedAt: report.updatedAt.toISOString(),
        dmcaReportUrl: `${this.configService.get<string>('APP_URL')}/dmca/status/${report.id}`,
      },
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`DMCA status update sent to claimant for report #${report.id}`);
    } catch (error) {
      this.logger.error(`Failed to send DMCA status update to claimant for report #${report.id}:`, error);
    }
  }

  /**
   * Возвращает ID шаблона SendGrid для типа согласия
   * @param consentType Тип согласия
   * @returns ID шаблона
   */
  private getTemplateId(consentType: ConsentType): EmailTemplateId {
    const templates = {
      [ConsentType.TERMS_OF_SERVICE]: 'd-1234567890', // ID шаблона в SendGrid
      [ConsentType.PRIVACY_POLICY]: 'd-0987654321',
      [ConsentType.COOKIE_POLICY]: 'd-5678901234',
    };

    return templates[consentType] || templates[ConsentType.TERMS_OF_SERVICE];
  }
}
