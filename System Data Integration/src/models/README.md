# Data Models

This directory contains the data models for the Fee Intelligence & Market Benchmarking System.

## Overview

All models provide:
- **Constructor**: Accepts data in both camelCase (JavaScript) and snake_case (database) formats
- **validate()**: Returns `{ valid: boolean, errors: string[] }` for validation
- **toDatabase()**: Converts to snake_case format for database operations
- **toJSON()**: Converts to camelCase format for API responses

## Models

### User
Represents a user in the system with role-based access control.

**Fields:**
- `id`: UUID
- `username`: String (required, unique)
- `passwordHash`: String (required)
- `email`: String (required, validated)
- `fullName`: String (required)
- `role`: Enum (CONTRIBUTOR, VALIDATOR, PARTNER, SPV_MANAGER_PM)
- `isActive`: Boolean (default: true)
- `createdAt`, `updatedAt`: Timestamps

**Example:**
```javascript
const { User, USER_ROLES } = require('./models');

const user = new User({
  username: 'john.doe',
  email: 'john@example.com',
  full_name: 'John Doe',
  role: USER_ROLES.CONTRIBUTOR
});

const validation = user.validate();
if (validation.valid) {
  // Save to database
  const dbData = user.toDatabase();
}
```

### FeeData
Represents fee competitor data submitted by contributors.

**Fields:**
- `id`: UUID
- `contributorId`: UUID (required)
- `source`: String (required)
- `serviceType`: String (required)
- `feeAmount`: Decimal (required, >= 0)
- `currency`: String (default: 'IDR')
- `date`: Date (required)
- `description`: Text
- `status`: Enum (PENDING, NEED_CLARIFICATION, ACCEPTED, REJECTED)
- `validatorId`: UUID
- `validationNotes`: Text
- `validatedAt`: Timestamp
- `createdAt`, `updatedAt`: Timestamps

**Example:**
```javascript
const { FeeData, VALIDATION_STATUS } = require('./models');

const feeData = new FeeData({
  contributor_id: userId,
  source: 'Market Report Q1 2024',
  service_type: 'Audit Services',
  fee_amount: 150000000,
  date: '2024-01-15',
  description: 'Comprehensive audit services'
});

const validation = feeData.validate();
```

### CrossDivisionData
Represents cross-functional division information.

**Fields:**
- `id`: UUID
- `contributorId`: UUID (required)
- `title`: String (required)
- `divisionCategory`: String (required)
- `description`: Text (required)
- `attachmentUrl`: String
- `status`: Enum (PENDING, NEED_CLARIFICATION, ACCEPTED, REJECTED)
- `validatorId`: UUID
- `validationNotes`: Text
- `validatedAt`: Timestamp
- `createdAt`, `updatedAt`: Timestamps

### Notification
Represents in-app notifications for users.

**Fields:**
- `id`: UUID
- `userId`: UUID (required)
- `type`: Enum (NEW_DATA_SUBMITTED, VALIDATION_REQUIRED, CLARIFICATION_NEEDED, DATA_ACCEPTED, DATA_REJECTED, POINTS_EARNED)
- `message`: String (required)
- `metadata`: JSON
- `isRead`: Boolean (default: false)
- `createdAt`: Timestamp
- `readAt`: Timestamp

**Example:**
```javascript
const { Notification, NOTIFICATION_TYPE } = require('./models');

const notification = new Notification({
  user_id: userId,
  type: NOTIFICATION_TYPE.DATA_ACCEPTED,
  message: 'Your fee data submission has been accepted',
  metadata: { dataId: feeDataId, points: 1 }
});
```

### PointTransaction
Represents point reward transactions for contributors.

**Fields:**
- `id`: UUID
- `contributorId`: UUID (required)
- `dataId`: UUID (required)
- `dataType`: Enum (FEE_DATA, CROSS_DIVISION_DATA)
- `points`: Integer (required, > 0)
- `description`: String (required)
- `createdAt`: Timestamp

**Example:**
```javascript
const { PointTransaction, DATA_TYPE } = require('./models');

const transaction = new PointTransaction({
  contributor_id: userId,
  data_id: feeDataId,
  data_type: DATA_TYPE.FEE_DATA,
  points: 1,
  description: 'Points awarded for accepted fee data'
});
```

### AuditLog
Represents audit trail for system operations.

**Fields:**
- `id`: UUID
- `userId`: UUID
- `action`: String (required) - e.g., CREATE, UPDATE, DELETE, VALIDATE, EXPORT
- `resourceType`: String (required) - e.g., FEE_DATA, CROSS_DIVISION_DATA
- `resourceId`: UUID
- `changes`: JSON
- `ipAddress`: String
- `userAgent`: String
- `createdAt`: Timestamp

**Example:**
```javascript
const { AuditLog } = require('./models');

const log = new AuditLog({
  user_id: userId,
  action: 'CREATE',
  resource_type: 'FEE_DATA',
  resource_id: feeDataId,
  changes: { source: 'Market Report', fee_amount: 100000 },
  ip_address: req.ip,
  user_agent: req.headers['user-agent']
});
```

### ClarificationEntry
Represents clarification requests and responses in the validation workflow.

**Fields:**
- `id`: UUID
- `dataId`: UUID (required)
- `dataType`: Enum (FEE_DATA, CROSS_DIVISION_DATA) (required)
- `requestedBy`: UUID (required) - Validator ID
- `requestedAt`: Timestamp
- `requestNotes`: Text (required)
- `respondedBy`: UUID - Contributor ID
- `respondedAt`: Timestamp
- `responseNotes`: Text

**Example:**
```javascript
const { ClarificationEntry } = require('./models');

const clarification = new ClarificationEntry({
  data_id: feeDataId,
  data_type: 'FEE_DATA',
  requested_by: validatorId,
  request_notes: 'Please provide more details about the data source',
  responded_by: contributorId,
  responded_at: '2024-01-02',
  response_notes: 'The source is from XYZ market report published in Q1 2024'
});
```

## Constants/Enums

All enums are exported from the index file:

```javascript
const {
  USER_ROLES,           // CONTRIBUTOR, VALIDATOR, PARTNER, SPV_MANAGER_PM
  VALIDATION_STATUS,    // PENDING, NEED_CLARIFICATION, ACCEPTED, REJECTED
  NOTIFICATION_TYPE,    // NEW_DATA_SUBMITTED, VALIDATION_REQUIRED, etc.
  DATA_TYPE            // FEE_DATA, CROSS_DIVISION_DATA
} = require('./models');
```

## Testing

Run the test script to verify all models:

```bash
node src/models/test-models.js
```

## Requirements

These models satisfy requirements 2.2 and 3.2 from the specification:
- Requirement 2.2: Input Data Fee Competitor oleh Contributor
- Requirement 3.2: Input Data Cross-Functional Division oleh Contributor
