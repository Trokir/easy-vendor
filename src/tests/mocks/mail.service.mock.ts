import { Injectable } from '@nestjs/common';
import { EmailService } from '../../services/email.service';

@Injectable()
export class MockMailService extends EmailService {
  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    // В тестах просто логируем отправку
    console.log(`Mock email sent to ${to}: ${subject}`);
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    console.log(`Mock password reset email sent to ${to}`);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    console.log(`Mock welcome email sent to ${to}`);
  }
} 