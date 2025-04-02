import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { LegalConsent } from '../entities/legal-consent.entity';
import { DmcaReport } from '../entities/dmca-report.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'easy_vendor',
  entities: [User, Vendor, LegalConsent, DmcaReport],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
