import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testDbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'easy_vendor_test',
  entities: ['./**/*.entity.ts'],
  synchronize: true,
  dropSchema: true,
  retryAttempts: 3,
  retryDelay: 3000,
  connectTimeoutMS: 10000,
};
