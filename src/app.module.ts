import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LegalConsentModule } from './legal-consent/legal-consent.module';
import { DmcaModule } from './modules/dmca/dmca.module';
import { typeOrmConfig } from './config/typeorm.config';
import { ServiceModule } from './modules/service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ServiceModule,
    AuthModule,
    LegalConsentModule,
    DmcaModule,
  ],
})
export class AppModule {}
