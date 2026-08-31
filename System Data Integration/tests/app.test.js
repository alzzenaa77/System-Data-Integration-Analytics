/**
 * Basic application tests
 */
const request = require('supertest');
const app = require('../src/index');

describe('Application Tests', () => {
  test('Health check endpoint returns 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message');
  });

  test('Unknown route returns 404', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('message', 'Route not found');
  });
});
