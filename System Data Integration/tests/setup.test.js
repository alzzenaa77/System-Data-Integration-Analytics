/**
 * Basic setup test to verify Jest and fast-check are working
 */
const fc = require('fast-check');

describe('Setup Tests', () => {
  test('Jest is working correctly', () => {
    expect(true).toBe(true);
  });

  test('fast-check is working correctly', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n === n; // Identity property
      })
    );
  });

  test('Environment variables are loaded', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBe('test_secret_key');
  });
});
