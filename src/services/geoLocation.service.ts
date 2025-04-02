interface RegionCache {
  region: string;
  timestamp: number;
}

// Enum for privacy legislation
export enum PrivacyLegislation {
  CCPA = 'CCPA',     // California Consumer Privacy Act
  CDPA = 'CDPA',     // Virginia Consumer Data Protection Act
  CPA = 'CPA',       // Colorado Privacy Act
  CTDPA = 'CTDPA',   // Connecticut Data Privacy Act
  UCPA = 'UCPA',     // Utah Consumer Privacy Act
  NONE = 'NONE',     // No applicable privacy legislation
}

interface GeoLocationResponse {
  country: string;
  region: string;
  city: string;
  postalCode: string;
  timezone: string;
  ip: string;
}

// Карта штатов и соответствующих законов
const STATE_LEGISLATION_MAP: Record<string, PrivacyLegislation> = {
  'CA': PrivacyLegislation.CCPA,    // California
  'VA': PrivacyLegislation.CDPA,    // Virginia
  'CO': PrivacyLegislation.CPA,     // Colorado
  'CT': PrivacyLegislation.CTDPA,   // Connecticut
  'UT': PrivacyLegislation.UCPA     // Utah
};

/**
 * Service to determine user's location
 */
export class GeoLocationService {
  private static readonly CACHE_KEY = 'user-region-cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly API_URL = 'https://api.ipapi.com/json/';

  /**
   * Determines if user is in California based on their IP
   */
  static async isCaliforniaUser(): Promise<boolean> {
    try {
      // Check if we have a cached result
      const cached = localStorage.getItem('is_california_user');
      if (cached !== null) {
        return cached === 'true';
      }
      
      // Get user location
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      const isInCalifornia = data.country?.iso_code === 'US' && data.subdivisions?.[0]?.iso_code === 'CA';
      
      // Cache the result
      localStorage.setItem('is_california_user', isInCalifornia.toString());
      
      return isInCalifornia;
    } catch (error) {
      console.error('Error detecting California user:', error);
      return false;
    }
  }

  /**
   * Determines applicable privacy legislation based on user location
   */
  static async getApplicableLegislation(): Promise<PrivacyLegislation> {
    try {
      // In a real app, this would call a geolocation API and determine legislation
      // For testing purposes, we assume CCPA
      return PrivacyLegislation.CCPA;
    } catch (error) {
      console.error('Error detecting applicable legislation:', error);
      return PrivacyLegislation.NONE;
    }
  }

  /**
   * Gets user's location details
   */
  static async getUserLocation(): Promise<GeoLocationResponse | null> {
    try {
      // In a real application, we would make an API call
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      return {
        country: data.country?.iso_code || 'US',
        region: data.subdivisions?.[0]?.iso_code || 'CA',
        city: data.city?.names?.en || 'San Francisco',
        postalCode: data.postal?.code || '94105',
        timezone: data.location?.time_zone || 'America/Los_Angeles',
        ip: data.traits?.ip_address || '192.168.1.1'
      };
    } catch (error) {
      console.error('Error getting user location:', error);
      return null;
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