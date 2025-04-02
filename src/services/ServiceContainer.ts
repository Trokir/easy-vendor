import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LegalConsentService } from '../legal-consent/legal-consent.service';
import { DmcaReportService } from './dmca-report.service';
import { EmailService } from './email.service';

/**
 * Service Container for Dependency Injection
 * This class is used to inject services into controllers and other services
 * It also provides a central place to mock services in tests
 */
@Injectable()
export class ServiceContainer {
  constructor(
    private readonly authService: AuthService,
    private readonly legalConsentService: LegalConsentService,
    private readonly dmcaReportService: DmcaReportService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Get the authentication service
   */
  getAuthService(): AuthService {
    return this.authService;
  }

  /**
   * Get the legal consent service
   */
  getLegalConsentService(): LegalConsentService {
    return this.legalConsentService;
  }

  /**
   * Get the DMCA report service
   */
  getDmcaReportService(): DmcaReportService {
    return this.dmcaReportService;
  }

  /**
   * Get the email service
   */
  getEmailService(): EmailService {
    return this.emailService;
  }
} 