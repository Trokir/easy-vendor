import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalConsent } from '../../entities/legal-consent.entity';
import { EmailService } from '../email/email.service';
import { User } from '../../entities/user.entity';
import { ConsentType } from '@/types/legal-consent';
import { CONSENT_EXPIRY_DAYS } from '../../utils/constants';
import { isConsentExpired } from '../../utils/helpers';

export interface ConsentMetadata {
  timestamp: number;
  [key: string]: any;
}

export interface ConsentResponse {
  success: boolean;
  message?: string;
}

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
    private emailService: EmailService,
  ) {
    this.baseUrl = '/api';
  }

  async checkConsent(
    userId: string,
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
    userId: string,
    consentType: ConsentType,
    version: string,
    metadata?: ConsentMetadata
  ): Promise<ConsentResponse> {
    const response = await fetch(`${this.baseUrl}/legal-consent/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        consentType,
        version,
        metadata: {
          ...metadata,
          timestamp: Date.now(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to record consent');
    }

    return response.json();
  }

  async getConsentHistory(userId: string): Promise<ConsentHistoryItem[]> {
    const response = await fetch(`${this.baseUrl}/legal-consent/history/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get consent history');
    }

    return response.json();
  }

  async revokeConsent(
    userId: string,
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
    userId: string,
    consentType: ConsentType,
    version: string,
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