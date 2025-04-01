import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async sendLegalConsentConfirmation(
    email: string,
    consentType: string,
    version: string,
    acceptedAt: Date
  ): Promise<void> {
    const msg = {
      to: email,
      from: this.configService.get<string>('SENDGRID_FROM_EMAIL'),
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
      this.logger.error(`Failed to send confirmation email to ${email}:`, error);
      // Не выбрасываем ошибку, чтобы не блокировать основной процесс
      return;
    }
  }

  private getTemplateId(consentType: string): string {
    const templates = {
      terms: this.configService.get<string>('SENDGRID_TERMS_TEMPLATE_ID'),
      privacy: this.configService.get<string>('SENDGRID_PRIVACY_TEMPLATE_ID'),
      cookies: this.configService.get<string>('SENDGRID_COOKIES_TEMPLATE_ID'),
    };

    return templates[consentType] || templates.terms;
  }
} 