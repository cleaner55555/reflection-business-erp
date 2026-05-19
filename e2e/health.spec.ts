import { test, expect } from '@playwright/test';

test.describe('API Health Check', () => {
  test('GET /api/health returns 200', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('/api/health');
    const elapsed = Date.now() - startTime;

    expect(response.status()).toBe(200);
    // Response should be fast (under 2 seconds)
    expect(elapsed).toBeLessThan(2000);
  });

  test('health response has required fields', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Check top-level fields
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('environment');
    expect(body).toHaveProperty('responseTime');
    expect(body).toHaveProperty('memory');
    expect(body).toHaveProperty('checks');

    // Status should be one of the expected values
    expect(['healthy', 'unhealthy', 'degraded']).toContain(body.status);

    // Memory should have used, total, rss
    expect(body.memory).toHaveProperty('used');
    expect(body.memory).toHaveProperty('total');
    expect(body.memory).toHaveProperty('rss');

    // Checks should include database
    expect(body.checks).toHaveProperty('database');
    expect(['ok', 'degraded', 'error']).toContain(body.checks.database.status);

    // Timestamp should be a valid ISO date
    const timestamp = new Date(body.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();

    // Version should be a string
    expect(typeof body.version).toBe('string');
  });

  test('health response time is under 2 seconds', async ({ request }) => {
    const startTime = Date.now();
    await request.get('/api/health');
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(2000);
  });

  test('health check includes storage check', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();

    expect(body.checks).toHaveProperty('storage');
    expect(['ok', 'degraded', 'error']).toContain(body.checks.storage.status);
  });

  test('health endpoint returns JSON content type', async ({ request }) => {
    const response = await request.get('/api/health');
    
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('health endpoint uptime is a positive number', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();

    expect(typeof body.uptime).toBe('number');
    expect(body.uptime).toBeGreaterThan(0);
  });

  test('health endpoint memory values contain MB units', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();

    expect(body.memory.used).toContain('MB');
    expect(body.memory.total).toContain('MB');
    expect(body.memory.rss).toContain('MB');
  });
});
