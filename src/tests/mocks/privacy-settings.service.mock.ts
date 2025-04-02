import { Injectable } from '@nestjs/common';
import { PrivacySettingsService } from '../../services/privacySettings.service';
import { UserPrivacyPreference } from '../../entities/UserPrivacyPreference';

@Injectable()
export class MockPrivacySettingsService extends PrivacySettingsService {
  private preferences: UserPrivacyPreference[] = [];

  async getSettings(userId: number): Promise<UserPrivacyPreference | null> {
    return this.preferences.find(pref => pref.userId === userId) || null;
  }

  async updateSettings(userId: number, data: Partial<UserPrivacyPreference>): Promise<UserPrivacyPreference> {
    const existingPref = await this.getSettings(userId);
    
    if (!existingPref) {
      const newPref = {
        id: Math.floor(Math.random() * 1000),
        userId,
        ccpaOptOut: false,
        optOutDate: null,
        region: 'US',
        dataDeleteRequested: false,
        deleteRequestDate: null,
        additionalPreferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      } as UserPrivacyPreference;
      
      this.preferences.push(newPref);
      return newPref;
    }

    const updatedPref = {
      ...existingPref,
      ...data,
      updatedAt: new Date(),
    };
    
    const index = this.preferences.findIndex(pref => pref.userId === userId);
    this.preferences[index] = updatedPref;
    
    return updatedPref;
  }

  async setCCPAOptOut(userId: number, optOut: boolean): Promise<UserPrivacyPreference> {
    return this.updateSettings(userId, {
      ccpaOptOut: optOut,
      optOutDate: optOut ? new Date() : null,
    });
  }

  async requestDataDelete(userId: number): Promise<UserPrivacyPreference> {
    return this.updateSettings(userId, {
      dataDeleteRequested: true,
      deleteRequestDate: new Date(),
    });
  }

  async isCaliforniaUser(userId: number): Promise<boolean> {
    const settings = await this.getSettings(userId);
    return settings?.region === 'CA';
  }
} 