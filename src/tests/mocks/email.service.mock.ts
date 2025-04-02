import { Injectable } from '@nestjs/common';
import { EmailService } from '../../services/email.service';

@Injectable()
export class MockEmailService extends EmailService {
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

  async sendDmcaNotification(to: string, reportId: string): Promise<void> {
    console.log(`Mock DMCA notification sent to ${to} for report ${reportId}`);
  }

  async sendDmcaResponse(to: string, reportId: string): Promise<void> {
    console.log(`Mock DMCA response sent to ${to} for report ${reportId}`);
  }

  async sendDmcaUpdate(to: string, reportId: string, status: string): Promise<void> {
    console.log(`Mock DMCA status update sent to ${to} for report ${reportId}: ${status}`);
  }
} 