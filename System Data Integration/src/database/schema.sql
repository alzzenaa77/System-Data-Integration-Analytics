-- Fee Intelligence & Market Benchmarking System
-- Database Schema for PostgreSQL
-- Requirements: 13.1, 13.2

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS point_transactions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS clarification_history CASCADE;
DROP TABLE IF EXISTS cross_division_data CASCADE;
DROP TABLE IF EXISTS fee_data CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS validation_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS data_type CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('CONTRIBUTOR', 'VALIDATOR', 'PARTNER', 'SPV_MANAGER_PM');
CREATE TYPE validation_status AS ENUM ('PENDING', 'NEED_CLARIFICATION', 'ACCEPTED', 'REJECTED');
CREATE TYPE notification_type AS ENUM ('NEW_DATA_SUBMITTED', 'VALIDATION_REQUIRED', 'CLARIFICATION_NEEDED', 'DATA_ACCEPTED', 'DATA_REJECTED', 'POINTS_EARNED');
CREATE TYPE data_type AS ENUM ('FEE_DATA', 'CROSS_DIVISION_DATA');

-- Table: users
-- Stores user information with role-based access control
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: fee_data
-- Stores fee competitor data submitted by contributors
CREATE TABLE fee_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Identitas Pengisi (Submitter Identity)
    submitter_name VARCHAR(255) NOT NULL,
    submitter_division VARCHAR(255) NOT NULL,
    submitter_input_date DATE NOT NULL,
    
    -- Identitas (Service Provider & Recipient Identity)
    service_provider VARCHAR(255) NOT NULL,
    service_recipient VARCHAR(255) NOT NULL,
    
    -- Detail Jasa (Service Details)
    service_type VARCHAR(255) NOT NULL,
    scope_of_work TEXT NOT NULL,
    tax_year VARCHAR(10) NOT NULL,
    
    -- Financial Data
    financial_type VARCHAR(255) NOT NULL,
    financial_description TEXT NOT NULL,
    fee_scheme VARCHAR(255) NOT NULL,
    fee_amount DECIMAL(15, 2) NOT NULL CHECK (fee_amount >= 0),
    currency VARCHAR(10) DEFAULT 'IDR',
    financial_date DATE NOT NULL,
    
    -- System fields
    status validation_status DEFAULT 'PENDING',
    validator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    validation_notes TEXT,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fee_data_validator_check CHECK (
        (status = 'PENDING' AND validator_id IS NULL) OR
        (status != 'PENDING' AND validator_id IS NOT NULL)
    )
);

-- Table: cross_division_data
-- Stores cross-functional division data submitted by contributors
CREATE TABLE cross_division_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(500) NOT NULL,
    division_category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    submission_date DATE NOT NULL,
    attachment_url VARCHAR(1000),
    status validation_status DEFAULT 'PENDING',
    validator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    validation_notes TEXT,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cross_division_validator_check CHECK (
        (status = 'PENDING' AND validator_id IS NULL) OR
        (status != 'PENDING' AND validator_id IS NOT NULL)
    )
);

-- Table: clarification_history
-- Stores clarification requests and responses between validators and contributors
CREATE TABLE clarification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_id UUID NOT NULL,
    data_type data_type NOT NULL,
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    request_notes TEXT NOT NULL,
    responded_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_notes TEXT
);

-- Table: notifications
-- Stores in-app notifications for users
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Table: point_transactions
-- Stores point reward transactions for contributors
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    data_id UUID NOT NULL,
    data_type data_type NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: audit_logs
-- Stores audit trail for all data operations
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization

-- Users table indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Fee data table indexes
CREATE INDEX idx_fee_data_contributor_id ON fee_data(contributor_id);
CREATE INDEX idx_fee_data_status ON fee_data(status);
CREATE INDEX idx_fee_data_validator_id ON fee_data(validator_id);
CREATE INDEX idx_fee_data_service_type ON fee_data(service_type);
CREATE INDEX idx_fee_data_service_provider ON fee_data(service_provider);
CREATE INDEX idx_fee_data_service_recipient ON fee_data(service_recipient);
CREATE INDEX idx_fee_data_tax_year ON fee_data(tax_year);
CREATE INDEX idx_fee_data_fee_scheme ON fee_data(fee_scheme);
CREATE INDEX idx_fee_data_financial_date ON fee_data(financial_date);
CREATE INDEX idx_fee_data_created_at ON fee_data(created_at);
CREATE INDEX idx_fee_data_status_date ON fee_data(status, financial_date);

-- Cross division data table indexes
CREATE INDEX idx_cross_division_contributor_id ON cross_division_data(contributor_id);
CREATE INDEX idx_cross_division_status ON cross_division_data(status);
CREATE INDEX idx_cross_division_validator_id ON cross_division_data(validator_id);
CREATE INDEX idx_cross_division_category ON cross_division_data(division_category);
CREATE INDEX idx_cross_division_created_at ON cross_division_data(created_at);
CREATE INDEX idx_cross_division_status_category ON cross_division_data(status, division_category);

-- Clarification history table indexes
CREATE INDEX idx_clarification_data_id ON clarification_history(data_id);
CREATE INDEX idx_clarification_data_type ON clarification_history(data_type);
CREATE INDEX idx_clarification_requested_by ON clarification_history(requested_by);
CREATE INDEX idx_clarification_responded_by ON clarification_history(responded_by);
CREATE INDEX idx_clarification_data_id_type ON clarification_history(data_id, data_type);

-- Notifications table indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Point transactions table indexes
CREATE INDEX idx_point_transactions_contributor_id ON point_transactions(contributor_id);
CREATE INDEX idx_point_transactions_data_id ON point_transactions(data_id);
CREATE INDEX idx_point_transactions_data_type ON point_transactions(data_type);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at);

-- Audit logs table indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Triggers for automatic updated_at timestamp

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for fee_data table
CREATE TRIGGER update_fee_data_updated_at
    BEFORE UPDATE ON fee_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for cross_division_data table
CREATE TRIGGER update_cross_division_data_updated_at
    BEFORE UPDATE ON cross_division_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation

COMMENT ON TABLE users IS 'Stores user accounts with role-based access control';
COMMENT ON TABLE fee_data IS 'Stores fee competitor data submitted by contributors';
COMMENT ON TABLE cross_division_data IS 'Stores cross-functional division information';
COMMENT ON TABLE clarification_history IS 'Tracks clarification requests and responses';
COMMENT ON TABLE notifications IS 'Stores in-app notifications for users';
COMMENT ON TABLE point_transactions IS 'Records point rewards for contributors';
COMMENT ON TABLE audit_logs IS 'Audit trail for all system operations';

COMMENT ON COLUMN users.role IS 'User role: CONTRIBUTOR, VALIDATOR, PARTNER, or SPV_MANAGER_PM';
COMMENT ON COLUMN fee_data.status IS 'Validation status: PENDING, NEED_CLARIFICATION, ACCEPTED, or REJECTED';
COMMENT ON COLUMN cross_division_data.status IS 'Validation status: PENDING, NEED_CLARIFICATION, ACCEPTED, or REJECTED';
COMMENT ON COLUMN notifications.metadata IS 'Additional data in JSON format (e.g., dataId, points)';
COMMENT ON COLUMN audit_logs.changes IS 'JSON object containing the changes made';
