import { ConsentType, ConsentMetadata, ConsentResponse } from '../../types/consent.types';

export class LegalConsentClient {
  constructor(private baseUrl: string) {}

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
    metadata?: ConsentMetadata
  ): Promise<ConsentResponse> {
    const response = await fetch(`${this.baseUrl}/legal-consent/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, consentType, version, metadata }),
    });

    if (!response.ok) {
      throw new Error('Failed to record consent');
    }

    return response.json();
  }

  async hasValidConsent(
    userId: number,
    consentType: ConsentType,
    version: string
  ): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/legal-consent/valid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, consentType, version }),
    });

    if (!response.ok) {
      throw new Error('Failed to check consent validity');
    }

    return response.json();
  }
} 