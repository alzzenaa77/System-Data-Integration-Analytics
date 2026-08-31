# Database Schema Documentation

## Overview

This directory contains the SQL schema and seed data for the Fee Intelligence & Market Benchmarking System. The database is designed for PostgreSQL and implements a comprehensive data model supporting role-based access control, data validation workflows, notifications, point rewards, and audit logging.

## Files

- **schema.sql**: Complete database schema with all tables, indexes, constraints, and triggers
- **seed.sql**: Sample data for testing and development purposes

## Database Schema

### Tables

1. **users**: User accounts with role-based access control
   - Roles: CONTRIBUTOR, VALIDATOR, PARTNER, SPV_MANAGER_PM
   - Stores authentication credentials and user profile information

2. **fee_data**: Fee competitor data submitted by contributors
   - Tracks validation status and workflow
   - Includes validator notes and timestamps

3. **cross_division_data**: Cross-functional division information
   - Similar validation workflow as fee_data
   - Supports file attachments

4. **clarification_history**: Clarification requests and responses
   - Tracks communication between validators and contributors
   - Supports both fee_data and cross_division_data

5. **notifications**: In-app notifications for users
   - Supports multiple notification types
   - Tracks read/unread status

6. **point_transactions**: Point reward transactions for contributors
   - Records points earned for accepted data submissions
   - Maintains complete transaction history

7. **audit_logs**: Audit trail for all system operations
   - Tracks all data operations (CREATE, UPDATE, DELETE, VALIDATE, EXPORT, VIEW)
   - Stores IP address and user agent for security

### Enums

- **user_role**: CONTRIBUTOR, VALIDATOR, PARTNER, SPV_MANAGER_PM
- **validation_status**: PENDING, NEED_CLARIFICATION, ACCEPTED, REJECTED
- **notification_type**: NEW_DATA_SUBMITTED, VALIDATION_REQUIRED, CLARIFICATION_NEEDED, DATA_ACCEPTED, DATA_REJECTED, POINTS_EARNED
- **data_type**: FEE_DATA, CROSS_DIVISION_DATA

## Setup Instructions

### Prerequisites

- PostgreSQL 12 or higher
- Database user with CREATE privileges

### Initial Setup

1. Create a new database:
```bash
createdb fee_intelligence_db
```

2. Run the schema creation script:
```bash
psql -d fee_intelligence_db -f src/database/schema.sql
```

3. (Optional) Load seed data for testing:
```bash
psql -d fee_intelligence_db -f src/database/seed.sql
```

### Using psql

```bash
# Connect to the database
psql -d fee_intelligence_db

# Run schema
\i src/database/schema.sql

# Run seed data
\i src/database/seed.sql

# List all tables
\dt

# Describe a specific table
\d users
\d fee_data
```

### Using Node.js

```javascript
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'your_username',
  host: 'localhost',
  database: 'fee_intelligence_db',
  password: 'your_password',
  port: 5432,
});

// Run schema
const schema = fs.readFileSync('src/database/schema.sql', 'utf8');
await pool.query(schema);

// Run seed data
const seed = fs.readFileSync('src/database/seed.sql', 'utf8');
await pool.query(seed);
```

## Key Features

### Automatic Timestamps

The schema includes triggers that automatically update the `updated_at` column whenever a record is modified in the following tables:
- users
- fee_data
- cross_division_data

### Constraints

- **Foreign Key Constraints**: Ensure referential integrity across tables
- **Check Constraints**: Validate data at the database level (e.g., fee_amount >= 0)
- **Unique Constraints**: Prevent duplicate usernames and emails
- **Validation Constraints**: Ensure validator_id is set when status is not PENDING

### Indexes

Comprehensive indexes are created for:
- Primary keys (automatic)
- Foreign keys
- Frequently queried columns (status, dates, roles)
- Composite indexes for common query patterns

### Performance Optimization

- Partial index on notifications for unread messages
- Composite indexes for dashboard queries
- Indexes on date columns for time-based filtering

## Seed Data

The seed data includes:

- **5 users**: 2 contributors, 1 validator, 1 partner, 1 manager
- **7 fee data records**: With various statuses (ACCEPTED, PENDING, NEED_CLARIFICATION, REJECTED)
- **4 cross-division data records**: With various statuses
- **2 clarification history entries**: For data needing clarification
- **5 point transactions**: For accepted data submissions
- **10 notifications**: For various user actions
- **8 audit log entries**: Tracking system operations

### Test Credentials

All test users have the password: `password123` (hashed)

- **contributor1** / password123 - John Contributor
- **contributor2** / password123 - Jane Contributor
- **validator1** / password123 - Alice Validator
- **partner1** / password123 - Bob Partner
- **manager1** / password123 - Charlie Manager

**Note**: The password hashes in seed.sql are placeholders. You should generate real bcrypt hashes before using in production.

## Maintenance

### Reset Database

To completely reset the database:

```bash
psql -d fee_intelligence_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -d fee_intelligence_db -f src/database/schema.sql
psql -d fee_intelligence_db -f src/database/seed.sql
```

### Backup Database

```bash
pg_dump fee_intelligence_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
psql -d fee_intelligence_db < backup_20240101_120000.sql
```

## Requirements Mapping

This schema implements the following requirements:

- **Requirement 13.1**: Secure data storage with encryption support
- **Requirement 13.2**: Audit trail for all data operations
- **Requirement 13.3**: Role-based access control at database level

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- UUIDs are used for primary keys to avoid sequential ID enumeration attacks
- JSONB columns are used for flexible metadata storage
- The schema supports PostgreSQL-specific features (ENUM types, JSONB, UUID)

## Migration Strategy

For production deployments, consider using a migration tool like:
- **node-pg-migrate**
- **Knex.js migrations**
- **Sequelize migrations**
- **TypeORM migrations**

This allows for versioned, incremental schema changes.
