import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalConsentController } from './legal-consent.controller';
import { LegalConsentService } from './legal-consent.service';
import { LegalConsent } from '../entities/legal-consent.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LegalConsent, User]),
  ],
  controllers: [LegalConsentController],
  providers: [LegalConsentService],
  exports: [LegalConsentService],
})
export class LegalConsentModule {} 