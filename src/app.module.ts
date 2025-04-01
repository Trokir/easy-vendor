import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LegalConsent } from './entities/legal-consent.entity';
import { User } from './entities/user.entity';
import { LegalConsentService } from './services/legal-consent/legal-consent.service';
import { EmailService } from './services/email/email.service';
import { LegalConsentController } from './controllers/legal-consent/legal-consent.controller';
import { databaseConfig } from './config/database.config';
import { emailConfig } from './config/email.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          database: databaseConfig,
          sendgrid: emailConfig.sendgrid,
        }),
      ],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([LegalConsent, User]),
  ],
  controllers: [LegalConsentController],
  providers: [LegalConsentService, EmailService],
})
export class AppModule {} 