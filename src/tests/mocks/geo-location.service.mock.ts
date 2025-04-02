import { Injectable } from '@nestjs/common';
import { GeoLocationService } from '../../services/geoLocation.service';

@Injectable()
export class MockGeoLocationService extends GeoLocationService {
  async getLocation(ip: string): Promise<{
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
  }> {
    // В тестах возвращаем фиксированные данные
    return {
      country: 'US',
      region: 'CA',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
    };
  }

  async isCaliforniaUser(ip: string): Promise<boolean> {
    return ip === 'test.california.ip';
  }

  async getTimezone(ip: string): Promise<string> {
    return 'America/Los_Angeles';
  }

  async getCountryCode(ip: string): Promise<string> {
    return 'US';
  }
} 