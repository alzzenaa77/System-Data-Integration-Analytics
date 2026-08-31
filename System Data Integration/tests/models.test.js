/**
 * Unit tests for data models
 * Requirements: 2.2, 3.2
 */

const {
  User,
  FeeData,
  CrossDivisionData,
  Notification,
  PointTransaction,
  AuditLog,
  ClarificationEntry,
  USER_ROLES,
  VALIDATION_STATUS,
  NOTIFICATION_TYPE,
  DATA_TYPE
} = require('../src/models');

describe('User Model', () => {
  test('should create valid user with all required fields', () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      full_name: 'Test User',
      role: USER_ROLES.CONTRIBUTOR
    });

    const validation = user.validate();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should fail validation without username', () => {
    const user = new User({
      email: 'test@example.com',
      full_name: 'Test User',
      role: USER_ROLES.CONTRIBUTOR
    });

    const validation = user.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Username is required');
  });

  test('should fail validation with invalid email', () => {
    const user = new User({
      username: 'testuser',
      email: 'invalid-email',
      full_name: 'Test User',
      role: USER_ROLES.CONTRIBUTOR
    });

    const validation = user.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Email format is invalid');
  });

  test('should fail validation with invalid role', () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'INVALID_ROLE'
    });

    const validation = user.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Valid role is required (CONTRIBUTOR, VALIDATOR, PARTNER, SPV_MANAGER_PM)');
  });

  test('should convert to database format correctly', () => {
    const user = new User({
      id: '123',
      username: 'testuser',
      password_hash: 'hashed',
      email: 'test@example.com',
      full_name: 'Test User',
      role: USER_ROLES.CONTRIBUTOR
    });

    const dbFormat = user.toDatabase();
    expect(dbFormat.contributor_id).toBeUndefined();
    expect(dbFormat.password_hash).toBe('hashed');
    expect(dbFormat.full_name).toBe('Test User');
  });

  test('should exclude password from JSON output', () => {
    const user = new User({
      username: 'testuser',
      password_hash: 'hashed',
      email: 'test@example.com',
      full_name: 'Test User',
      role: USER_ROLES.CONTRIBUTOR
    });

    const json = user.toJSON();
    expect(json.passwordHash).toBeUndefined();
    expect(json.password_hash).toBeUndefined();
  });
});

describe('FeeData Model', () => {
  test('should create valid fee data with all required fields', () => {
    const feeData = new FeeData({
      contributor_id: '123',
      source: 'Market Report',
      service_type: 'Audit',
      fee_amount: 100000,
      date: '2024-01-01'
    });

    const validation = feeData.validate();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(feeData.status).toBe(VALIDATION_STATUS.PENDING);
  });

  test('should fail validation without contributor ID', () => {
    const feeData = new FeeData({
      source: 'Market Report',
      service_type: 'Audit',
      fee_amount: 100000,
      date: '2024-01-01'
    });

    const validation = feeData.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Contributor ID is required');
  });

  test('should fail validation with negative fee amount', () => {
    const feeData = new FeeData({
      contributor_id: '123',
      source: 'Market Report',
      service_type: 'Audit',
      fee_amount: -100,
      date: '2024-01-01'
    });

    const validation = feeData.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Fee amount must be a positive number');
  });

  test('should default to IDR currency', () => {
    const feeData = new FeeData({
      contributor_id: '123',
      source: 'Market Report',
      service_type: 'Audit',
      fee_amount: 100000,
      date: '2024-01-01'
    });

    expect(feeData.currency).toBe('IDR');
  });

  test('should convert between camelCase and snake_case', () => {
    const feeData = new FeeData({
      contributorId: '123',
      serviceType: 'Audit',
      feeAmount: 100000,
      source: 'Market Report',
      date: '2024-01-01'
    });

    const dbFormat = feeData.toDatabase();
    expect(dbFormat.contributor_id).toBe('123');
    expect(dbFormat.service_type).toBe('Audit');
    expect(dbFormat.fee_amount).toBe(100000);
  });
});

describe('CrossDivisionData Model', () => {
  test('should create valid cross-division data', () => {
    const crossData = new CrossDivisionData({
      contributor_id: '123',
      title: 'Test Document',
      division_category: 'IT',
      description: 'Test description'
    });

    const validation = crossData.validate();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should fail validation without title', () => {
    const crossData = new CrossDivisionData({
      contributor_id: '123',
      division_category: 'IT',
      description: 'Test description'
    });

    const validation = crossData.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Title is required');
  });

  test('should fail validation without description', () => {
    const crossData = new CrossDivisionData({
      contributor_id: '123',
      title: 'Test Document',
      division_category: 'IT'
    });

    const validation = crossData.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Description is required');
  });

  test('should allow optional attachment URL', () => {
    const crossData = new CrossDivisionData({
      contributor_id: '123',
      title: 'Test Document',
      division_category: 'IT',
      description: 'Test description',
      attachment_url: 'https://example.com/file.pdf'
    });

    const validation = crossData.validate();
    expect(validation.valid).toBe(true);
    expect(crossData.attachmentUrl).toBe('https://example.com/file.pdf');
  });
});

describe('Notification Model', () => {
  test('should create valid notification', () => {
    const notification = new Notification({
      user_id: '123',
      type: NOTIFICATION_TYPE.DATA_ACCEPTED,
      message: 'Your data has been accepted'
    });

    const validation = notification.validate();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(notification.isRead).toBe(false);
  });

  test('should fail validation with invalid type', () => {
    const notification = new Notification({
      user_id: '123',
      type: 'INVALID_TYPE',
      message: 'Test message'
    });

    const validation = notification.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Valid notification type is required');
  });

  test('should fail validation without message', () => {
    const notification = new Notification({
      user_id: '123',
      type: NOTIFICATION_TYPE.DATA_ACCEPTED
    });

    const validation = notification.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Message is required');
  });

  test('should support metadata', () => {
    const notification = new Notification({
      user_id: '123',
      type: NOTIFICATION_TYPE.DATA_ACCEPTED,
      message: 'Your data has been accepted',
      metadata: { dataId: '456', points: 1 }
    });

    const validation = notification.validate();
    expect(validation.valid).toBe(true);
    expect(notification.metadata).toEqual({ dataId: '456', points: 1 });
  });
});

describe('PointTransaction Model', () => {
  test('should create valid point transaction', () => {
    const pointTx = new PointTransaction({
      contributor_id: '123',
      data_id: '456',
      data_type: DATA_TYPE.FEE_DATA,
      points: 1,
      description: 'Points for accepted data'
    });

    const validation = pointTx.validate();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should fail validation with invalid data type', () => {
    const pointTx = new PointTransaction({
      contributor_id: '123',
      data_id: '456',
      data_type: 'INVALID_TYPE',
      points: 1,
      description: 'Points for accepted data'
    });

    const validation = pointTx.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Valid data type is required (FEE_DATA or CROSS_DIVISION_DATA)');
  });

  test('should fail validation with zero or negative points', () => {
    const pointTx = new PointTransaction({
      contributor_id: '123',
      data_id: '456',
      data_type: DATA_TYPE.FEE_DATA,
      points: 0,
      description: 'Points for accepted data'
    });

    const validation = pointTx.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Points must be a positive number');
  });
});

describe('AuditLog Model', () => {
  test('should create valid audit log', () => {
    const auditLog = new AuditLog({
      user_id: '123',
      action: 'CREATE',
      resource_type: 'FEE_DATA',
      resource_id: '456'
    });

    const validation = auditLog.validate();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should fail validation without action', () => {
    const auditLog = new AuditLog({
      user_id: '123',
      resource_type: 'FEE_DATA',
      resource_id: '456'
    });

    const validation = auditLog.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Action is required');
  });

  test('should fail validation without resource type', () => {
    const auditLog = new AuditLog({
      user_id: '123',
      action: 'CREATE',
      resource_id: '456'
    });

    const validation = auditLog.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Resource type is required');
  });

  test('should allow optional fields', () => {
    const auditLog = new AuditLog({
      action: 'LOGIN',
      resource_type: 'USER',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0'
    });

    const validation = auditLog.validate();
    expect(validation.valid).toBe(true);
    expect(auditLog.userId).toBeNull();
    expect(auditLog.ipAddress).toBe('192.168.1.1');
  });
});


describe('ClarificationEntry Model', () => {
  test('should create valid clarification entry', () => {
    const clarification = new ClarificationEntry({
      data_id: '456',
      data_type: 'FEE_DATA',
      requested_by: '123',
      request_notes: 'Please provide more details'
    });

    const validation = clarification.validate();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should fail validation without data ID', () => {
    const clarification = new ClarificationEntry({
      data_type: 'FEE_DATA',
      requested_by: '123',
      request_notes: 'Please provide more details'
    });

    const validation = clarification.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Data ID is required');
  });

  test('should fail validation with invalid data type', () => {
    const clarification = new ClarificationEntry({
      data_id: '456',
      data_type: 'INVALID_TYPE',
      requested_by: '123',
      request_notes: 'Please provide more details'
    });

    const validation = clarification.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Valid data type is required (FEE_DATA or CROSS_DIVISION_DATA)');
  });

  test('should fail validation without request notes', () => {
    const clarification = new ClarificationEntry({
      data_id: '456',
      data_type: 'FEE_DATA',
      requested_by: '123'
    });

    const validation = clarification.validate();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Request notes are required');
  });

  test('should allow optional response fields', () => {
    const clarification = new ClarificationEntry({
      data_id: '456',
      data_type: 'FEE_DATA',
      requested_by: '123',
      request_notes: 'Please provide more details',
      responded_by: '789',
      responded_at: '2024-01-02',
      response_notes: 'Here are the details'
    });

    const validation = clarification.validate();
    expect(validation.valid).toBe(true);
    expect(clarification.respondedBy).toBe('789');
    expect(clarification.responseNotes).toBe('Here are the details');
  });

  test('should convert between camelCase and snake_case', () => {
    const clarification = new ClarificationEntry({
      dataId: '456',
      dataType: 'FEE_DATA',
      requestedBy: '123',
      requestNotes: 'Please provide more details'
    });

    const dbFormat = clarification.toDatabase();
    expect(dbFormat.data_id).toBe('456');
    expect(dbFormat.data_type).toBe('FEE_DATA');
    expect(dbFormat.requested_by).toBe('123');
    expect(dbFormat.request_notes).toBe('Please provide more details');
  });
});
