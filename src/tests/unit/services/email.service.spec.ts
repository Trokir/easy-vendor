import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { EmailService } from '../../../services/email.service';
import { ConsentType } from '../../../types/legal-consent';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

// Хелпер для создания тестового модуля
const createEmailServiceTestModule = async () => {
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'SENDGRID_API_KEY') return 'test-api-key';
      if (key === 'EMAIL_FROM') return 'noreply@example.com';
      if (key === 'TEMPLATES_TERMS') return 'd-1234567890';
      if (key === 'TEMPLATES_PRIVACY') return 'd-0987654321';
      return undefined;
    }),
  };

  return Test.createTestingModule({
    providers: [
      EmailService,
      {
        provide: ConfigService,
        useValue: mockConfigService,
      },
    ],
  }).compile();
};

describe('EmailService', () => {
  let service: EmailService;
  let logger: jest.SpyInstance;

  beforeEach(async () => {
    const module = await createEmailServiceTestModule();
    service = module.get<EmailService>(EmailService);
    logger = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    
    // Сбрасываем мокировки перед каждым тестом
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendLegalConsentConfirmation', () => {
    it('should initialize SendGrid with API key on first call', async () => {
      // Arrange
      const email = 'user@example.com';
      const consentType = ConsentType.TERMS_OF_SERVICE;
      const version = '1.0';
      const acceptedAt = new Date();

      // Act
      await service.sendLegalConsentConfirmation(email, consentType, version, acceptedAt);

      // Assert
      expect(SendGrid.setApiKey).toHaveBeenCalledWith('test-api-key');
    });

    it('should send email with correct parameters for terms', async () => {
      // Arrange
      const email = 'user@example.com';
      const consentType = ConsentType.TERMS_OF_SERVICE;
      const version = '1.0';
      const acceptedAt = new Date();

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
          acceptedAt: expect.any(String),
          userEmail: email,
        },
      });
    });

    it('should send email with correct parameters for privacy', async () => {
      // Arrange
      const email = 'user@example.com';
      const consentType = ConsentType.PRIVACY_POLICY;
      const version = '1.0';
      const acceptedAt = new Date();

      // Act
      await service.sendLegalConsentConfirmation(email, consentType, version, acceptedAt);

      // Assert
      expect(SendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: 'd-0987654321',
          subject: 'Legal Consent Confirmation - privacy_policy',
        })
      );
    });

    it('should initialize SendGrid only once for multiple calls', async () => {
      // Arrange
      const email = 'user@example.com';
      const version = '1.0';
      const acceptedAt = new Date();

      // Act
      await service.sendLegalConsentConfirmation(email, ConsentType.TERMS_OF_SERVICE, version, acceptedAt);
      await service.sendLegalConsentConfirmation(email, ConsentType.PRIVACY_POLICY, version, acceptedAt);

      // Assert
      expect(SendGrid.setApiKey).toHaveBeenCalledTimes(1);
    });

    it('should log error but not throw when SendGrid fails', async () => {
      // Arrange
      const email = 'user@example.com';
      const error = new Error('SendGrid error');
      (SendGrid.send as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await service.sendLegalConsentConfirmation(email, ConsentType.TERMS_OF_SERVICE, '1.0', new Date());

      // Assert
      expect(logger).toHaveBeenCalledWith(
        expect.stringContaining(`Failed to send consent confirmation email to ${email}:`),
        error
      );
    });

    it('should use correct template ID for each consent type', async () => {
      // Arrange
      const email = 'user@example.com';
      const version = '1.0';
      const acceptedAt = new Date();

      // Act & Assert для TERMS_OF_SERVICE
      await service.sendLegalConsentConfirmation(email, ConsentType.TERMS_OF_SERVICE, version, acceptedAt);
      expect(SendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: 'd-1234567890',
        })
      );

      // Сброс мока перед вторым вызовом
      (SendGrid.send as jest.Mock).mockClear();

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
