import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddUserPrivacyPreference1709424000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_privacy_preference',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'ccpa_opt_out',
            type: 'boolean',
            default: false,
          },
          {
            name: 'opt_out_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'region',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'data_delete_requested',
            type: 'boolean',
            default: false,
          },
          {
            name: 'delete_request_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'additional_preferences',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_USER_PRIVACY_PREFERENCE_USER_ID',
            columnNames: ['user_id'],
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_privacy_preference');
  }
} 