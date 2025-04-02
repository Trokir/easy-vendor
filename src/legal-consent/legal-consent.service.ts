import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalConsent } from '../entities/legal-consent.entity';
import { RecordConsentDto } from './dto/record-consent.dto';
import { ConsentStatusDto } from './dto/consent-status.dto';
import { ConsentHistoryDto } from './dto/consent-history.dto';
import { addDays } from 'date-fns';
import { ConsentType } from '../types/legal-consent';

@Injectable()
export class LegalConsentService {
  constructor(
    @InjectRepository(LegalConsent)
    private legalConsentRepository: Repository<LegalConsent>
  ) {}

  async recordConsent(dto: RecordConsentDto, ip: string): Promise<void> {
    const metadata = {
      ...dto.metadata,
      ip
    };

    await this.legalConsentRepository.save({
      userId: dto.userId,
      consentType: dto.type as unknown as ConsentType,
      version: dto.version,
      metadata
    });
  }

  async getConsentStatus(userId: number, type: string): Promise<ConsentStatusDto> {
    const consent = await this.legalConsentRepository.findOne({
      where: {
        userId,
        consentType: type as unknown as ConsentType,
      },
      order: {
        acceptedAt: 'DESC',
      },
    });

    if (!consent) {
      throw new NotFoundException(`No consent found for user ${userId} and type ${type}`);
    }

    const acceptedAt = new Date(consent.acceptedAt);
    const expiresAt = addDays(acceptedAt, 365); // Consent expires after 1 year

    return {
      isValid: new Date() < expiresAt,
      version: consent.version,
      acceptedAt,
      expiresAt,
      ip: consent.metadata?.ip,
    };
  }

  async getConsentHistory(userId: number, type?: string): Promise<ConsentHistoryDto[]> {
    const query = this.legalConsentRepository
      .createQueryBuilder('consent')
      .where('consent.userId = :userId', { userId });

    if (type) {
      query.andWhere('consent.consentType = :type', { type });
    }

    const consents = await query.orderBy('consent.acceptedAt', 'DESC').getMany();

    return consents.map(consent => ({
      type: consent.consentType,
      version: consent.version,
      acceptedAt: new Date(consent.acceptedAt),
      ip: consent.metadata?.ip,
      metadata: consent.metadata,
    }));
  }
}
