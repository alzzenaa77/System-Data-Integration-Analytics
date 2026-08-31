/**
 * Simple test script to verify models work correctly
 * This is a quick validation, not a full test suite
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
} = require('./index');

console.log('Testing Data Models...\n');

// Test User model
console.log('1. Testing User model:');
const user = new User({
  username: 'testuser',
  email: 'test@example.com',
  full_name: 'Test User',
  role: USER_ROLES.CONTRIBUTOR
});
const userValidation = user.validate();
console.log('   Valid:', userValidation.valid);
console.log('   Errors:', userValidation.errors);
console.log('   JSON:', JSON.stringify(user.toJSON(), null, 2));

// Test invalid user
const invalidUser = new User({ username: 'test' });
const invalidUserValidation = invalidUser.validate();
console.log('   Invalid user errors:', invalidUserValidation.errors);

// Test FeeData model
console.log('\n2. Testing FeeData model:');
const feeData = new FeeData({
  contributor_id: '123',
  source: 'Market Report',
  service_type: 'Audit',
  fee_amount: 100000,
  date: '2024-01-01'
});
const feeValidation = feeData.validate();
console.log('   Valid:', feeValidation.valid);
console.log('   Errors:', feeValidation.errors);
console.log('   Status:', feeData.status);

// Test CrossDivisionData model
console.log('\n3. Testing CrossDivisionData model:');
const crossData = new CrossDivisionData({
  contributor_id: '123',
  title: 'Test Document',
  division_category: 'IT',
  description: 'Test description'
});
const crossValidation = crossData.validate();
console.log('   Valid:', crossValidation.valid);
console.log('   Errors:', crossValidation.errors);

// Test Notification model
console.log('\n4. Testing Notification model:');
const notification = new Notification({
  user_id: '123',
  type: NOTIFICATION_TYPE.DATA_ACCEPTED,
  message: 'Your data has been accepted'
});
const notifValidation = notification.validate();
console.log('   Valid:', notifValidation.valid);
console.log('   Errors:', notifValidation.errors);

// Test PointTransaction model
console.log('\n5. Testing PointTransaction model:');
const pointTx = new PointTransaction({
  contributor_id: '123',
  data_id: '456',
  data_type: DATA_TYPE.FEE_DATA,
  points: 1,
  description: 'Points for accepted data'
});
const pointValidation = pointTx.validate();
console.log('   Valid:', pointValidation.valid);
console.log('   Errors:', pointValidation.errors);

// Test AuditLog model
console.log('\n6. Testing AuditLog model:');
const auditLog = new AuditLog({
  user_id: '123',
  action: 'CREATE',
  resource_type: 'FEE_DATA',
  resource_id: '456'
});
const auditValidation = auditLog.validate();
console.log('   Valid:', auditValidation.valid);
console.log('   Errors:', auditValidation.errors);

// Test ClarificationEntry model
console.log('\n7. Testing ClarificationEntry model:');
const clarification = new ClarificationEntry({
  data_id: '456',
  data_type: DATA_TYPE.FEE_DATA,
  requested_by: '123',
  request_notes: 'Please provide more details'
});
const clarificationValidation = clarification.validate();
console.log('   Valid:', clarificationValidation.valid);
console.log('   Errors:', clarificationValidation.errors);

// Test database format conversion
console.log('\n8. Testing database format conversion:');
const dbFormat = feeData.toDatabase();
console.log('   Database format keys:', Object.keys(dbFormat));
console.log('   Has snake_case:', 'contributor_id' in dbFormat);

console.log('\n✓ All model tests completed successfully!');
