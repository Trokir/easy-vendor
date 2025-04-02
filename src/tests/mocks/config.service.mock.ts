import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MockConfigService extends ConfigService {
  private config: Record<string, any> = {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '1h',
    SENDGRID_API_KEY: 'test-sendgrid-key',
    SENDGRID_TEMPLATE_ID: 'test-template-id',
  };

  get<T>(key: string): T {
    return this.config[key] as T;
  }

  set(key: string, value: any): void {
    this.config[key] = value;
  }
} 