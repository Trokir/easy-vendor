import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalConsent } from '../entities/legal-consent.entity';
import { EmailService } from './email.service';
import { User } from '../entities/user.entity';
import { ConsentType } from '../types/legal-consent';

@Injectable()
export class LegalConsentService {
  private readonly logger = new Logger(LegalConsentService.name);

  constructor(
    @InjectRepository(LegalConsent)
    private legalConsentRepository: Repository<LegalConsent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService
  ) {}

  /**
   * Records a new user consent
   * @param userId User ID
   * @param consentType Type of consent
   * @param version Document version
   * @param metadata Additional consent metadata
   */
  async recordConsent(
    userId: number, 
    consentType: ConsentType, 
    version: string,
    metadata?: Record<string, any>
  ): Promise<LegalConsent> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const consent = this.legalConsentRepository.create({
      userId,
      consentType,
      version,
      metadata,
      acceptedAt: new Date(),
    });

    const savedConsent = await this.legalConsentRepository.save(consent);

    try {
      await this.emailService.sendLegalConsentConfirmation(
        user.email,
        consentType,
        version,
        consent.acceptedAt
      );
    } catch (error) {
      this.logger.error(`Failed to send consent confirmation email to ${user.email}:`, error);
      // Continue execution as the consent has already been saved
    }

    return savedConsent;
  }

  /**
   * Checks for the existence of a valid user consent
   * @param userId User ID
   * @param consentType Type of consent to check (optional)
   * @param version Document version to check (optional)
   */
  async hasValidConsent(
    userId: number,
    consentType?: ConsentType,
    version?: string
  ): Promise<boolean> {
    const queryOptions: any = {
      where: { userId },
      order: { acceptedAt: 'DESC' },
    };

    // If consent type is specified, add it to the query condition
    if (consentType) {
      queryOptions.where.consentType = consentType;
    }

    // If version is specified, add it to the query condition
    if (version) {
      queryOptions.where.version = version;
    }

    const latestConsent = await this.legalConsentRepository.findOne(queryOptions);

    if (!latestConsent) return false;

    // Check if the consent has expired (1 year)
    const consentAge = Date.now() - latestConsent.acceptedAt.getTime();
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

    return consentAge < oneYearInMs;
  }

  /**
   * Gets the user's consent history
   * @param userId User ID
   */
  async getConsentHistory(userId: number): Promise<LegalConsent[]> {
    return this.legalConsentRepository.find({
      where: { userId },
      order: { acceptedAt: 'DESC' },
    });
  }
}
