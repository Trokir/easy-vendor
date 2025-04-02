import { Injectable } from '@nestjs/common';
import { LegalConsentService } from '../../services/legalConsent.service';
import { LegalConsent } from '../../entities/legal-consent.entity';
import { ConsentType } from '../../types/legal-consent';
import { User } from '../../entities/user.entity';

@Injectable()
export class MockLegalConsentService extends LegalConsentService {
  private consents: LegalConsent[] = [];

  async create(data: {
    userId: number;
    consentType: ConsentType;
    version: string;
    metadata?: Record<string, any>;
  }): Promise<LegalConsent> {
    const consent = {
      id: Math.random().toString(36).substr(2, 9),
      userId: data.userId,
      consentType: data.consentType,
      version: data.version,
      metadata: data.metadata,
      acceptedAt: new Date(),
      user: {} as User, // В тестах не нужен полный объект пользователя
    } as LegalConsent;

    this.consents.push(consent);
    return consent;
  }

  async findByUserId(userId: number): Promise<LegalConsent[]> {
    return this.consents.filter(consent => consent.userId === userId);
  }

  async findByType(userId: number, consentType: ConsentType): Promise<LegalConsent | null> {
    return this.consents.find(
      consent => consent.userId === userId && consent.consentType === consentType
    ) || null;
  }

  async update(id: string, data: Partial<LegalConsent>): Promise<LegalConsent | null> {
    const index = this.consents.findIndex(consent => consent.id === id);
    if (index === -1) return null;

    this.consents[index] = {
      ...this.consents[index],
      ...data,
    };
    return this.consents[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.consents.findIndex(consent => consent.id === id);
    if (index === -1) return false;

    this.consents.splice(index, 1);
    return true;
  }
} 