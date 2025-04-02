interface RegionCache {
  region: string;
  timestamp: number;
}

// Штаты с особым законодательством о конфиденциальности
export enum PrivacyLegislation {
  CCPA = 'CCPA',     // California Consumer Privacy Act
  CDPA = 'CDPA',     // Virginia Consumer Data Protection Act
  CPA = 'CPA',       // Colorado Privacy Act
  CTDPA = 'CTDPA',   // Connecticut Data Privacy Act
  UCPA = 'UCPA',     // Utah Consumer Privacy Act
  NONE = 'NONE'      // Нет специфического законодательства
}

// Карта штатов и соответствующих законов
const STATE_LEGISLATION_MAP: Record<string, PrivacyLegislation> = {
  'CA': PrivacyLegislation.CCPA,    // California
  'VA': PrivacyLegislation.CDPA,    // Virginia
  'CO': PrivacyLegislation.CPA,     // Colorado
  'CT': PrivacyLegislation.CTDPA,   // Connecticut
  'UT': PrivacyLegislation.UCPA     // Utah
};

export class GeoLocationService {
  private static readonly CACHE_KEY = 'user-region-cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly API_URL = 'https://api.ipapi.com/json/';

  static async isCaliforniaUser(): Promise<boolean> {
    try {
      const userState = await this.getUserState();
      return userState === 'CA';
    } catch (error) {
      console.error('Error determining if user is from California:', error);
      return false; // Default to false on error
    }
  }

  static async getUserState(): Promise<string> {
    try {
      const cachedData = this.getCachedRegion();
      if (cachedData) {
        return cachedData.region;
      }

      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch region data');
      }

      const data = await response.json();
      if (!data.region) {
        throw new Error('Invalid region data');
      }

      this.cacheRegion(data.region);
      return data.region;
    } catch (error) {
      console.error('Error determining user region:', error);
      return ''; // Return empty string on error
    }
  }

  static async getApplicableLegislation(): Promise<PrivacyLegislation> {
    try {
      const userState = await this.getUserState();
      return STATE_LEGISLATION_MAP[userState] || PrivacyLegislation.NONE;
    } catch (error) {
      console.error('Error determining applicable legislation:', error);
      return PrivacyLegislation.NONE; // Default to none on error
    }
  }

  private static getCachedRegion(): RegionCache | null {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (!cached) {
      return null;
    }

    try {
      const data: RegionCache = JSON.parse(cached);
      if (Date.now() - data.timestamp > this.CACHE_DURATION) {
        this.clearCache();
        return null;
      }
      return data;
    } catch {
      this.clearCache();
      return null;
    }
  }

  private static cacheRegion(region: string): void {
    const cacheData: RegionCache = {
      region,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
  }

  static clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }
} 