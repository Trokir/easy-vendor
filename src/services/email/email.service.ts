import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { ConsentType } from '../legal-consent/legal-consent.types';
import { EmailTemplateData, getEmailSubject } from './email.templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('sendgrid.apiKey'));
  }

  async sendLegalConsentConfirmation(
    email: string,
    consentType: ConsentType,
    version: string,
    acceptedAt: Date
  ): Promise<void> {
    const templateData: EmailTemplateData = {
      consentType,
      version,
      acceptedAt: acceptedAt.toISOString(),
      userEmail: email,
    };

    const msg = {
      to: email,
      from: this.configService.get<string>('sendgrid.fromEmail'),
      subject: getEmailSubject(consentType),
      templateId: this.getTemplateId(consentType),
      dynamicTemplateData: templateData,
    };

    try {
      await SendGrid.send(msg);
    } catch (error) {
      this.logger.error(`Failed to send confirmation email to ${email}:`, error);
      // Не выбрасываем ошибку, чтобы не блокировать основной процесс
      return;
    }
  }

  private getTemplateId(consentType: ConsentType): string {
    const templates = this.configService.get('sendgrid.templates');
    return templates[consentType] || templates.terms;
  }
} 