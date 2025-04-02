-- Rollback for initial schema
-- Migration: 001_initial_schema_rollback.sql
-- Created at: [Current Timestamp]

-- Drop triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_legal_consents_user_id;
DROP INDEX IF EXISTS idx_legal_consents_document_type;

-- Drop tables
DROP TABLE IF EXISTS legal_consents;
DROP TABLE IF EXISTS users; 