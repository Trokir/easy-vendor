import { Injectable } from '@nestjs/common';
import { EmailService } from '../email.service';
import { ConsentType } from '../../types/legal-consent';

/**
 * Адаптер для совместимости с тестами, использующими mailService
 */
@Injectable()
export class MailService {
  constructor(private emailService: EmailService) {}

  /**
   * Отправляет подтверждение отказа от продажи данных CCPA
   * @param userId ID пользователя
   */
  async sendCCPAOptOutConfirmation(userId: number): Promise<void> {
    try {
      // В реальном приложении здесь был бы код для получения email пользователя по userId
      const userEmail = `user-${userId}@example.com`;
      await this.emailService.sendLegalConsentConfirmation(
        userEmail,
        ConsentType.PRIVACY_POLICY,
        '1.0',
        new Date()
      );
    } catch (error) {
      console.error('Failed to send CCPA opt-out confirmation:', error);
    }
  }

  /**
   * Отправляет подтверждение запроса на удаление данных
   * @param userId ID пользователя
   */
  async sendDataDeletionConfirmation(userId: number): Promise<void> {
    try {
      // В реальном приложении здесь был бы код для получения email пользователя по userId
      const userEmail = `user-${userId}@example.com`;
      await this.emailService.sendLegalConsentConfirmation(
        userEmail,
        ConsentType.PRIVACY_POLICY,
        '1.0',
        new Date()
      );
    } catch (error) {
      console.error('Failed to send data deletion confirmation:', error);
    }
  }
} 