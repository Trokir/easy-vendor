import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalConsent } from '../../entities/legal-consent.entity';
import { EmailService } from '../email.service';
import { User } from '../../entities/user.entity';
import { ConsentType, ConsentMetadata, ConsentResponse } from '../../types/consent.types';
import { CONSENT_EXPIRY_DAYS } from '../../utils/constants';
import { isConsentExpired } from '../../utils/helpers';

export interface ConsentHistoryItem {
  type: ConsentType;
  version: string;
  accepted: boolean;
  timestamp: number;
  metadata?: ConsentMetadata;
}

@Injectable()
export class LegalConsentService {
  private readonly logger = new Logger(LegalConsentService.name);
  private baseUrl: string;

  constructor(
    @InjectRepository(LegalConsent)
    private legalConsentRepository: Repository<LegalConsent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService
  ) {
    this.baseUrl = '/api';
  }

  async checkConsent(
    userId: number,
    consentType: ConsentType,
    version: string
  ): Promise<{ accepted: boolean; timestamp: number }> {
    const response = await fetch(`${this.baseUrl}/legal-consent/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, consentType, version }),
    });

    if (!response.ok) {
      throw new Error('Failed to check consent status');
    }

    return response.json();
  }

  async recordConsent(
    userId: number,
    consentType: ConsentType,
    version: string,
    metadata?: Partial<ConsentMetadata>
  ): Promise<ConsentResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const timestamp = Date.now();
    const consent = this.legalConsentRepository.create({
      userId,
      consentType,
      version,
      acceptedAt: new Date(),
      metadata: {
        ...metadata,
        timestamp,
      },
    });

    const savedConsent = await this.legalConsentRepository.save(consent);
    return {
      id: savedConsent.id,
      userId: savedConsent.userId,
      consentType: savedConsent.consentType,
      version: savedConsent.version,
      acceptedAt: savedConsent.acceptedAt,
      metadata: {
        ...savedConsent.metadata,
        timestamp,
      },
    };
  }

  async getConsentHistory(userId: number): Promise<ConsentResponse[]> {
    const consents = await this.legalConsentRepository.find({
      where: { userId },
      order: { acceptedAt: 'DESC' },
    });

    return consents.map(consent => ({
      id: consent.id,
      userId: consent.userId,
      consentType: consent.consentType,
      version: consent.version,
      acceptedAt: consent.acceptedAt,
      metadata: {
        ...consent.metadata,
        timestamp: consent.metadata?.timestamp || Date.now(),
      },
    }));
  }

  async revokeConsent(
    userId: number,
    consentType: ConsentType,
    version: string
  ): Promise<ConsentResponse> {
    const response = await fetch(`${this.baseUrl}/legal-consent/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, consentType, version }),
    });

    if (!response.ok) {
      throw new Error('Failed to revoke consent');
    }

    return response.json();
  }

  async hasValidConsent(
    userId: number,
    consentType: ConsentType,
    version: string
  ): Promise<boolean> {
    const latestConsent = await this.legalConsentRepository.findOne({
      where: {
        userId,
        consentType,
        version,
      },
      order: { acceptedAt: 'DESC' },
    });

    if (!latestConsent) return false;

    return !isConsentExpired(latestConsent.acceptedAt, CONSENT_EXPIRY_DAYS);
  }
}
