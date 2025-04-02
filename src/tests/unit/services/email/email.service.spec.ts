import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../../../../services/email.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { ConsentType } from '../../../../types/legal-consent';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

describe('EmailService', () => {
  let service: EmailService;
  let config: ConfigService;
  let logger: jest.SpyInstance;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'SENDGRID_API_KEY') return 'test-api-key';
      if (key === 'EMAIL_FROM') return 'noreply@example.com';
      if (key === 'TEMPLATES_TERMS') return 'd-1234567890';
      if (key === 'TEMPLATES_PRIVACY') return 'd-0987654321';
      return undefined;
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
    config = module.get<ConfigService>(ConfigService);
    logger = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendLegalConsentConfirmation', () => {
    it('should send email with correct parameters', async () => {
      // Arrange
      const email = 'user@example.com';
      const consentType = ConsentType.TERMS_OF_SERVICE;
      const version = '1.0';
      const acceptedAt = new Date('2025-04-02T01:11:16.539Z');

      // Act
      await service.sendLegalConsentConfirmation(email, consentType, version, acceptedAt);

      // Assert
      expect(SendGrid.send).toHaveBeenCalledWith({
        to: email,
        from: 'noreply@example.com',
        subject: 'Legal Consent Confirmation - terms_of_service',
        templateId: 'd-1234567890',
        dynamicTemplateData: {
          consentType,
          version,
          acceptedAt: acceptedAt.toISOString(),
          userEmail: email,
        },
      });
    });

    it('should log error but not throw when SendGrid fails', async () => {
      // Arrange
      const error = new Error('SendGrid error');
      (SendGrid.send as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await service.sendLegalConsentConfirmation('user@example.com', ConsentType.TERMS_OF_SERVICE, '1.0', new Date());

      // Assert
      expect(logger).toHaveBeenCalledWith(
        'Failed to send consent confirmation email to user@example.com:',
        error
      );
    });

    it('should use correct template IDs for different consent types', async () => {
      // Arrange
      const email = 'user@example.com';
      const version = '1.0';
      const acceptedAt = new Date('2025-04-02T01:11:16.561Z');

      // Act & Assert для TERMS_OF_SERVICE
      await service.sendLegalConsentConfirmation(email, ConsentType.TERMS_OF_SERVICE, version, acceptedAt);
      expect(SendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: 'd-1234567890',
        })
      );

      // Сбросим mock
      jest.clearAllMocks();

      // Act & Assert для PRIVACY_POLICY
      await service.sendLegalConsentConfirmation(email, ConsentType.PRIVACY_POLICY, version, acceptedAt);
      expect(SendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: 'd-0987654321',
        })
      );
    });
  });
});
