import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Vendor } from './src/entities/vendor.entity';
import { LegalConsent } from './src/entities/legal-consent.entity';
import { DmcaReport } from './src/entities/dmca-report.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
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