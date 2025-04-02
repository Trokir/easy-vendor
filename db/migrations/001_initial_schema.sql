-- Initial database schema
-- Migration: 001_initial_schema.sql
-- Created at: [Current Timestamp]

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cookies_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create legal_consents table
CREATE TABLE legal_consents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('tos', 'privacy', 'cookies')),
    ip VARCHAR(45) NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_legal_consents_user_id ON legal_consents(user_id);
CREATE INDEX idx_legal_consents_document_type ON legal_consents(document_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE legal_consents IS 'Stores user legal consent records';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.password_hash IS 'Hashed password for user authentication';
COMMENT ON COLUMN users.cookies_accepted IS 'User cookie consent status';
COMMENT ON COLUMN legal_consents.document_type IS 'Type of legal document (tos/privacy/cookies)';
COMMENT ON COLUMN legal_consents.ip IS 'IP address of user when consent was given'; 