-- Fee Intelligence & Market Benchmarking System
-- Database Schema for MySQL
-- Requirements: 13.1, 13.2

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS point_transactions;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS clarification_history;
DROP TABLE IF EXISTS cross_division_data;
DROP TABLE IF EXISTS fee_data;
DROP TABLE IF EXISTS users;

-- Table: users
-- Stores user information with role-based access control
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('CONTRIBUTOR', 'VALIDATOR', 'PARTNER', 'SPV_MANAGER_PM') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: fee_data
-- Stores fee competitor data submitted by contributors
CREATE TABLE fee_data (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    contributor_id CHAR(36) NOT NULL,
    
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
    status ENUM('PENDING', 'NEED_CLARIFICATION', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    validator_id CHAR(36) NULL,
    validation_notes TEXT NULL,
    validated_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contributor_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (validator_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_fee_data_contributor_id (contributor_id),
    INDEX idx_fee_data_status (status),
    INDEX idx_fee_data_validator_id (validator_id),
    INDEX idx_fee_data_service_type (service_type),
    INDEX idx_fee_data_service_provider (service_provider),
    INDEX idx_fee_data_service_recipient (service_recipient),
    INDEX idx_fee_data_tax_year (tax_year),
    INDEX idx_fee_data_fee_scheme (fee_scheme),
    INDEX idx_fee_data_financial_date (financial_date),
    INDEX idx_fee_data_created_at (created_at),
    INDEX idx_fee_data_status_date (status, financial_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: cross_division_data
-- Stores cross-functional division data submitted by contributors
CREATE TABLE cross_division_data (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    contributor_id CHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    division_category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    submission_date DATE NOT NULL,
    attachment_url VARCHAR(1000) NULL,
    status ENUM('PENDING', 'NEED_CLARIFICATION', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    validator_id CHAR(36) NULL,
    validation_notes TEXT NULL,
    validated_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contributor_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (validator_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_cross_division_contributor_id (contributor_id),
    INDEX idx_cross_division_status (status),
    INDEX idx_cross_division_validator_id (validator_id),
    INDEX idx_cross_division_category (division_category),
    INDEX idx_cross_division_created_at (created_at),
    INDEX idx_cross_division_status_category (status, division_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: clarification_history
-- Stores clarification requests and responses between validators and contributors
CREATE TABLE clarification_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    data_id CHAR(36) NOT NULL,
    data_type ENUM('FEE_DATA', 'CROSS_DIVISION_DATA') NOT NULL,
    requested_by CHAR(36) NOT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    request_notes TEXT NOT NULL,
    responded_by CHAR(36) NULL,
    responded_at DATETIME NULL,
    response_notes TEXT NULL,
    
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_clarification_data_id (data_id),
    INDEX idx_clarification_data_type (data_type),
    INDEX idx_clarification_requested_by (requested_by),
    INDEX idx_clarification_responded_by (responded_by),
    INDEX idx_clarification_data_id_type (data_id, data_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications
-- Stores in-app notifications for users
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    type ENUM('NEW_DATA_SUBMITTED', 'VALIDATION_REQUIRED', 'CLARIFICATION_NEEDED', 'DATA_ACCEPTED', 'DATA_REJECTED', 'POINTS_EARNED') NOT NULL,
    message TEXT NOT NULL,
    metadata JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_user_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: point_transactions
-- Stores point reward transactions for contributors
CREATE TABLE point_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    contributor_id CHAR(36) NOT NULL,
    data_id CHAR(36) NOT NULL,
    data_type ENUM('FEE_DATA', 'CROSS_DIVISION_DATA') NOT NULL,
    points INT NOT NULL CHECK (points > 0),
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contributor_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_point_transactions_contributor_id (contributor_id),
    INDEX idx_point_transactions_data_id (data_id),
    INDEX idx_point_transactions_data_type (data_type),
    INDEX idx_point_transactions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: audit_logs
-- Stores audit trail for all data operations
CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id CHAR(36) NULL,
    changes JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_resource_type (resource_type),
    INDEX idx_audit_logs_resource_id (resource_id),
    INDEX idx_audit_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
