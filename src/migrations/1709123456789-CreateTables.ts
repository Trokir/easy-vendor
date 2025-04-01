import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1709123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create vendors table
    await queryRunner.query(`
      CREATE TABLE vendors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        business_name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) UNIQUE,
        template_type VARCHAR(50) NOT NULL,
        config JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create legal_consents table
    await queryRunner.query(`
      CREATE TABLE legal_consents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        document_type VARCHAR(20) NOT NULL,
        ip VARCHAR(45),
        accepted_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_vendors_domain ON vendors(domain) WHERE domain IS NOT NULL;
      CREATE INDEX idx_vendors_user_id ON vendors(user_id);
      CREATE INDEX idx_legal_consents_user_id ON legal_consents(user_id);
      CREATE INDEX idx_legal_consents_document_type ON legal_consents(document_type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_legal_consents_document_type;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_legal_consents_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vendors_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_vendors_domain;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS legal_consents;`);
    await queryRunner.query(`DROP TABLE IF EXISTS vendors;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
} 