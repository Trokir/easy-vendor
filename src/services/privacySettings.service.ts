export interface PrivacySettings {
  doNotSell: boolean;
  email: string;
  lastUpdated: string;
}

export interface CCPAOptOutResponse {
  success: boolean;
  message: string;
}

export class PrivacySettingsService {
  private static readonly API_URL = '/api/privacy-settings';

  static async getSettings(): Promise<PrivacySettings> {
    const response = await fetch(this.API_URL);
    if (!response.ok) {
      throw new Error('Failed to load privacy settings');
    }
    return response.json();
  }

  static async updateSettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const response = await fetch(this.API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to update privacy settings');
    }

    return response.json();
  }

  static async setCCPAOptOut(value: boolean): Promise<CCPAOptOutResponse> {
    const response = await fetch(`${this.API_URL}/ccpa-opt-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doNotSell: value }),
    });

    if (!response.ok) {
      throw new Error('Failed to update CCPA opt-out status');
    }

    return response.json();
  }
} 