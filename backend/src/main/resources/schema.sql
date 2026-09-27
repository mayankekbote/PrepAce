-- Enable pgcrypto for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone_number VARCHAR(20),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    target_role VARCHAR(100),
    experience_level VARCHAR(50),
    resume_url VARCHAR(500),
    resume_filename VARCHAR(255),
    profile_picture VARCHAR(500),
    auth_provider VARCHAR(20) DEFAULT 'LOCAL',
    google_id VARCHAR(255),
    is_email_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    role VARCHAR(30) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure role column exists if table was previously created
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'USER';
ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS termination_reason VARCHAR(255);
ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS proctoring_violations_count INT DEFAULT 0;
ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS proctoring_events_json TEXT;

-- Proctoring Events Table
CREATE TABLE IF NOT EXISTS proctoring_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'WARNING',
    timestamp TIMESTAMP DEFAULT NOW(),
    duration DOUBLE PRECISION,
    confidence DOUBLE PRECISION,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_proctoring_events_session FOREIGN KEY (interview_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
