import { Module } from '@nestjs/common';
import { ServiceContainer } from '../services/ServiceContainer';
import { AuthModule } from '../auth/auth.module';
import { LegalConsentModule } from '../legal-consent/legal-consent.module';
import { DmcaModule } from './dmca.module';
import { EmailModule } from './email.module';

/**
 * Module for service container
 * This module imports all service modules and provides the service container
 */
@Module({
  imports: [
    AuthModule,
    LegalConsentModule,
    DmcaModule,
    EmailModule,
  ],
  providers: [ServiceContainer],
  exports: [ServiceContainer],
})
export class ServiceModule {} 