import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPrivacyPreference } from '../../entities/UserPrivacyPreference';
import { MailService } from '../mail/mailService';

@Injectable()
export class CCPAService {
  constructor(
    @InjectRepository(UserPrivacyPreference)
    private privacyPreferenceRepository: Repository<UserPrivacyPreference>,
    private mailService: MailService,
  ) {}

  async setOptOut(userId: number, optOut: boolean): Promise<void> {
    const preference = await this.privacyPreferenceRepository.findOne({
      where: { userId },
    });

    if (preference) {
      preference.ccpaOptOut = optOut;
      preference.optOutDate = optOut ? new Date() : null;
    } else {
      const newPreference = this.privacyPreferenceRepository.create({
        userId,
        ccpaOptOut: optOut,
        optOutDate: optOut ? new Date() : null,
      });
      await this.privacyPreferenceRepository.save(newPreference);
    }

    // Send confirmation email
    if (optOut) {
      await this.mailService.sendCCPAOptOutConfirmation(userId);
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
    await this.mailService.sendDataDeletionConfirmation(userId, requestId);

    return requestId;
  }

  async getDataCategories(): Promise<{
    collected: string[];
    sold: string[];
    disclosed: string[];
  }> {
    // In a real application, this data should be dynamic
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