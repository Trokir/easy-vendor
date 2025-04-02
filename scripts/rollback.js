const fs = require('fs');
const path = require('path');
const { pool } = require('../utils/db');

async function rollbackMigrations() {
  const client = await pool.connect();

  try {
    // Get last executed migration
    const { rows: lastMigration } = await client.query(
      'SELECT name FROM migrations ORDER BY id DESC LIMIT 1'
    );

    if (lastMigration.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const lastMigrationName = lastMigration[0].name;
    const rollbackFileName = lastMigrationName.replace('.sql', '_rollback.sql');
    const rollbackPath = path.join(__dirname, '../db/migrations', rollbackFileName);

    if (!fs.existsSync(rollbackPath)) {
      console.error(`Rollback file not found: ${rollbackFileName}`);
      return;
    }

    console.log(`Rolling back migration: ${lastMigrationName}`);

    const rollbackSQL = fs.readFileSync(rollbackPath, 'utf8');

    await client.query('BEGIN');

    try {
      await client.query(rollbackSQL);
      await client.query('DELETE FROM migrations WHERE name = $1', [lastMigrationName]);
      await client.query('COMMIT');
      console.log(`Rollback of ${lastMigrationName} completed successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error rolling back migration ${lastMigrationName}:`, error);
      throw error;
    }
  } finally {
    client.release();
  }
}

rollbackMigrations().catch(console.error);
