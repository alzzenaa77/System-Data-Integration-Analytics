// Test setup file
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.DB_NAME = 'fee_intelligence_test';

// Increase test timeout for property-based tests
jest.setTimeout(30000);
