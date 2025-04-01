import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { EmailService } from '../../../services/email.service';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let logger: jest.SpyInstance;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'SENDGRID_API_KEY': 'test-api-key',
        'SENDGRID_FROM_EMAIL': 'test@example.com',
        'SENDGRID_TERMS_TEMPLATE_ID': 'terms-template-id',
        'SENDGRID_PRIVACY_TEMPLATE_ID': 'privacy-template-id',
        'SENDGRID_COOKIES_TEMPLATE_ID': 'cookies-template-id',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
    logger = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendLegalConsentConfirmation', () => {
    it('should send email with correct parameters', async () => {
      const email = 'user@example.com';
      const consentType = 'terms';
      const version = '1.0';
      const acceptedAt = new Date();

      await service.sendLegalConsentConfirmation(email, consentType, version, acceptedAt);

      expect(SendGrid.send).toHaveBeenCalledWith({
        to: email,
        from: 'test@example.com',
        subject: 'Legal Consent Confirmation - terms',
        templateId: 'terms-template-id',
        dynamicTemplateData: {
          consentType,
          version,
          acceptedAt: acceptedAt.toISOString(),
          userEmail: email,
        },
      });
      expect(logger.mock.calls.length).toBe(0);
    });

    it('should log error but not throw when SendGrid fails', async () => {
      const error = new Error('SendGrid error');
      (SendGrid.send as jest.Mock).mockRejectedValue(error);

      await service.sendLegalConsentConfirmation(
        'user@example.com',
        'terms',
        '1.0',
        new Date()
      );

      expect(logger).toHaveBeenCalledWith(
        'Failed to send confirmation email to user@example.com:',
        error
      );
    });

    it('should use default template ID when consent type is unknown', async () => {
      const email = 'user@example.com';
      const consentType = 'unknown';
      const version = '1.0';
      const acceptedAt = new Date();

      (SendGrid.send as jest.Mock).mockResolvedValue(undefined);

      await service.sendLegalConsentConfirmation(email, consentType, version, acceptedAt);

      expect(SendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: 'terms-template-id',
        })
      );
    });
  });
}); 