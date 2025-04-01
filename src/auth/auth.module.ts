import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { LegalConsent } from '../entities/legal-consent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vendor, LegalConsent]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {} 