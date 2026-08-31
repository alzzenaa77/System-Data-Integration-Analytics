# Database Schema

This document describes the database schema for the Fee Intelligence & Market Benchmarking System.

## Tables

### users
Stores user information and authentication data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('CONTRIBUTOR', 'VALIDATOR', 'PARTNER', 'SPV_MANAGER_PM')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### fee_data
Stores fee competitor data submitted by contributors.

```sql
CREATE TABLE fee_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES users(id),
  source VARCHAR(255) NOT NULL,
  service_type VARCHAR(255) NOT NULL,
  fee_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  date DATE NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'NEED_CLARIFICATION', 'ACCEPTED', 'REJECTED')),
  validator_id UUID REFERENCES users(id),
  validation_notes TEXT,
  validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### cross_division_data
Stores cross-functional division data submitted by contributors.

```sql
CREATE TABLE cross_division_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  division_category VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  attachment_url VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'NEED_CLARIFICATION', 'ACCEPTED', 'REJECTED')),
  validator_id UUID REFERENCES users(id),
  validation_notes TEXT,
  validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### clarification_history
Stores clarification requests and responses.

```sql
CREATE TABLE clarification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_id UUID NOT NULL,
  data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('FEE_DATA', 'CROSS_DIVISION_DATA')),
  requested_by UUID NOT NULL REFERENCES users(id),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  request_notes TEXT NOT NULL,
  responded_by UUID REFERENCES users(id),
  responded_at TIMESTAMP,
  response_notes TEXT
);
```

### notifications
Stores in-app notifications for users.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('NEW_DATA_SUBMITTED', 'VALIDATION_REQUIRED', 'CLARIFICATION_NEEDED', 'DATA_ACCEPTED', 'DATA_REJECTED', 'POINTS_EARNED')),
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);
```

### point_transactions
Stores point transactions for contributors.

```sql
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES users(id),
  data_id UUID NOT NULL,
  data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('FEE_DATA', 'CROSS_DIVISION_DATA')),
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### audit_logs
Stores audit trail for all operations.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- Users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Fee Data
CREATE INDEX idx_fee_data_contributor ON fee_data(contributor_id);
CREATE INDEX idx_fee_data_status ON fee_data(status);
CREATE INDEX idx_fee_data_validator ON fee_data(validator_id);
CREATE INDEX idx_fee_data_service_type ON fee_data(service_type);
CREATE INDEX idx_fee_data_date ON fee_data(date);

-- Cross Division Data
CREATE INDEX idx_cross_division_contributor ON cross_division_data(contributor_id);
CREATE INDEX idx_cross_division_status ON cross_division_data(status);
CREATE INDEX idx_cross_division_validator ON cross_division_data(validator_id);
CREATE INDEX idx_cross_division_category ON cross_division_data(division_category);

-- Clarification History
CREATE INDEX idx_clarification_data ON clarification_history(data_id, data_type);
CREATE INDEX idx_clarification_requested_by ON clarification_history(requested_by);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Point Transactions
CREATE INDEX idx_point_transactions_contributor ON point_transactions(contributor_id);
CREATE INDEX idx_point_transactions_data ON point_transactions(data_id, data_type);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## Notes

- All tables use UUID for primary keys for better scalability and security
- Timestamps use TIMESTAMP type for consistency
- Status fields use CHECK constraints to ensure data integrity
- Foreign keys ensure referential integrity
- Indexes are created on frequently queried columns for performance
- JSONB is used for flexible metadata storage in notifications and audit logs
