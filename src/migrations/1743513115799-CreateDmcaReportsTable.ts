import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDmcaReportsTable1743513115799 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE dmca_reports (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                content_url VARCHAR(255) NOT NULL,
                complainant_name VARCHAR(255) NOT NULL,
                complainant_email VARCHAR(255) NOT NULL,
                complainant_phone VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                is_processed BOOLEAN DEFAULT FALSE,
                processed_at TIMESTAMP,
                processing_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE dmca_reports;`);
    }

}
