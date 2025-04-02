import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { DmcaReportStatus } from '../dto/dmca-report.dto';

export class AddDmcaReportsTable1717359585000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем enum тип для статуса DMCA отчета
    await queryRunner.query(`
      CREATE TYPE dmca_report_status_enum AS ENUM (
        'pending',
        'reviewing',
        'valid',
        'invalid',
        'counter_notice',
        'resolved',
        'rejected'
      );
    `);

    // Создаем таблицу dmca_reports
    await queryRunner.createTable(
      new Table({
        name: 'dmca_reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'claimant_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'claimant_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'respondent_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'content_url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'original_work_url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'is_sworn_statement',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'dmca_report_status_enum',
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'admin_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'assigned_to',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Создаем индексы для оптимизации поиска
    await queryRunner.createIndex(
      'dmca_reports',
      new TableIndex({
        name: 'idx_dmca_reports_status',
        columnNames: ['status'],
      })
    );

    await queryRunner.createIndex(
      'dmca_reports',
      new TableIndex({
        name: 'idx_dmca_reports_claimant_email',
        columnNames: ['claimant_email'],
      })
    );

    await queryRunner.createIndex(
      'dmca_reports',
      new TableIndex({
        name: 'idx_dmca_reports_created_at',
        columnNames: ['created_at'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индексы
    await queryRunner.dropIndex('dmca_reports', 'idx_dmca_reports_status');
    await queryRunner.dropIndex('dmca_reports', 'idx_dmca_reports_claimant_email');
    await queryRunner.dropIndex('dmca_reports', 'idx_dmca_reports_created_at');

    // Удаляем таблицу
    await queryRunner.dropTable('dmca_reports');

    // Удаляем enum тип
    await queryRunner.query(`DROP TYPE dmca_report_status_enum;`);
  }
} 