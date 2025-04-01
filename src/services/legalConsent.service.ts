import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalConsent } from '../entities/legalConsent.entity';
import { EmailService } from './email.service';
import { User } from '../entities/user.entity';

@Injectable()
export class LegalConsentService {
  private readonly logger = new Logger(LegalConsentService.name);

  constructor(
    @InjectRepository(LegalConsent)
    private legalConsentRepository: Repository<LegalConsent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async recordConsent(userId: string, consentType: string, version: string): Promise<LegalConsent> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const consent = this.legalConsentRepository.create({
      userId,
      consentType,
      version,
      acceptedAt: new Date(),
    });

    const savedConsent = await this.legalConsentRepository.save(consent);

    try {
      await this.emailService.sendLegalConsentConfirmation(
        user.email,
        consentType,
        version,
        consent.acceptedAt,
      );
    } catch (error) {
      this.logger.error(`Failed to send consent confirmation email to ${user.email}:`, error);
      // Продолжаем выполнение, так как согласие уже сохранено
    }

    return savedConsent;
  }

  async hasValidConsent(userId: string): Promise<boolean> {
    const latestConsent = await this.legalConsentRepository.findOne({
      where: { userId },
      order: { acceptedAt: 'DESC' },
    });

    if (!latestConsent) return false;

    // Проверяем, не истекло ли согласие (1 год)
    const consentAge = Date.now() - latestConsent.acceptedAt.getTime();
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

    return consentAge < oneYearInMs;
  }

  async getConsentHistory(userId: string): Promise<LegalConsent[]> {
    return this.legalConsentRepository.find({
      where: { userId },
      order: { acceptedAt: 'DESC' },
    });
  }
} 