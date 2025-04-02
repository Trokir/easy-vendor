import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CCPAController } from '../../controllers/privacy/ccpaController';
import { CCPAService } from '../../services/privacy/ccpaService';
import { UserPrivacyPreference } from '../../entities/UserPrivacyPreference';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPrivacyPreference]),
    MailModule,
  ],
  controllers: [CCPAController],
  providers: [CCPAService],
  exports: [CCPAService],
})
export class CCPAModule {} 