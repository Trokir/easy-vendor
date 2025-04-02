import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPrivacyPreference } from '../../entities/UserPrivacyPreference';
import { EmailService } from '../email.service';
import { ConsentType } from '../../types/legal-consent';

@Injectable()
export class CCPAService {
  constructor(
    @InjectRepository(UserPrivacyPreference)
    private privacyPreferenceRepository: Repository<UserPrivacyPreference>,
    private emailService: EmailService,
  ) {}

  async setOptOut(userId: number, optOut: boolean): Promise<void> {
    const preference = await this.privacyPreferenceRepository.findOne({
      where: { userId },
    });

    if (preference) {
      preference.ccpaOptOut = optOut;
      preference.optOutDate = optOut ? new Date() : null;
      await this.privacyPreferenceRepository.save(preference);
    } else {
      const newPreference = this.privacyPreferenceRepository.create({
        userId,
        ccpaOptOut: optOut,
        optOutDate: optOut ? new Date() : null,
      });
      await this.privacyPreferenceRepository.save(newPreference);
    }

    // Send confirmation email only when opting out
    if (optOut) {
      try {
        const userEmail = await this.getUserEmail(userId);
        if (userEmail) {
          await this.emailService.sendLegalConsentConfirmation(
            userEmail,
            ConsentType.PRIVACY_POLICY,
            '1.0',
            new Date()
          );
        }
      } catch (error) {
        console.error('Failed to send CCPA opt-out confirmation:', error);
      }
    }
  }

  async getOptOutStatus(userId: number): Promise<boolean> {
    const preference = await this.privacyPreferenceRepository.findOne({
      where: { userId },
    });
    return preference?.ccpaOptOut ?? false;
  }

  async requestDataDeletion(userId: number, reason?: string): Promise<string> {
    const preference = await this.privacyPreferenceRepository.findOne({
      where: { userId },
    });

    if (preference) {
      preference.dataDeleteRequested = true;
      preference.deleteRequestDate = new Date();
      await this.privacyPreferenceRepository.save(preference);
    } else {
      const newPreference = this.privacyPreferenceRepository.create({
        userId,
        dataDeleteRequested: true,
        deleteRequestDate: new Date(),
      });
      await this.privacyPreferenceRepository.save(newPreference);
    }

    // Generate unique request ID
    const requestId = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Send confirmation email
    try {
      const userEmail = await this.getUserEmail(userId);
      if (userEmail) {
        await this.emailService.sendLegalConsentConfirmation(
          userEmail,
          ConsentType.PRIVACY_POLICY,
          '1.0',
          new Date()
        );
      }
    } catch (error) {
      console.error('Failed to send data deletion confirmation:', error);
    }

    return requestId;
  }

  private async getUserEmail(userId: number): Promise<string | null> {
    // Implement user lookup or inject UserService
    // This is a placeholder implementation
    return `user-${userId}@example.com`;
  }

  async getDataCategories(): Promise<{
    collected: string[];
    sold: string[];
    disclosed: string[];
  }> {
    return {
      collected: [
        'Identification information',
        'Purchase information',
        'Website interaction data',
        'Technical data',
      ],
      sold: [
        'Service providers',
        'Payment processors',
        'Delivery services',
      ],
      disclosed: [
        'Advertising networks',
        'Analytics services',
        'Marketing partners',
      ],
    };
  }
} 