import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { LegalConsent } from '../entities/legal-consent.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'easy_vendor',
  entities: [User, Vendor, LegalConsent],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/migrations/*.ts'],
  migrationsRun: true,
  migrationsTableName: 'migrations',
};
