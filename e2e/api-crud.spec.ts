import { test, expect } from '@playwright/test';

test.describe('API CRUD Integration', () => {
  test.describe('Settings API', () => {
    test('GET /api/settings returns data (array)', async ({ request }) => {
      const response = await request.get('/api/settings');
      
      // Should return 200 (or at least not 500)
      expect(response.status()).toBeLessThan(500);
      
      const body = await response.json();
      // Settings returns an array (possibly empty)
      expect(Array.isArray(body)).toBeTruthy();
    });

    test('GET /api/settings with group filter', async ({ request }) => {
      const response = await request.get('/api/settings?group=general');
      
      expect(response.status()).toBeLessThan(500);
      
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
    });
  });

  test.describe('Roles API', () => {
    test('GET /api/roles returns roles array', async ({ request }) => {
      const response = await request.get('/api/roles');
      
      expect(response.status()).toBeLessThan(500);
      
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      
      // Each role should have key fields
      if (body.length > 0) {
        const role = body[0];
        expect(role).toHaveProperty('name');
        expect(role).toHaveProperty('displayName');
        expect(role).toHaveProperty('permissions');
      }
    });
  });

  test.describe('Audit Logs API', () => {
    test('GET /api/audit-logs requires companyId', async ({ request }) => {
      const response = await request.get('/api/audit-logs');
      
      // Should return 400 because companyId is required
      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body).toHaveProperty('error');
    });

    test('GET /api/audit-logs accepts query parameters', async ({ request }) => {
      const response = await request.get('/api/audit-logs?companyId=test-company&limit=10');
      
      // Should not return 500 — either 200 with data or a Prisma error
      expect(response.status()).toBeLessThan(500);
    });

    test('GET /api/audit-logs with filters', async ({ request }) => {
      const response = await request.get(
        '/api/audit-logs?companyId=test&entity=invoice&action=create&from=2024-01-01'
      );
      
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Dashboard API', () => {
    test('GET /api/dashboard returns response', async ({ request }) => {
      const response = await request.get('/api/dashboard');
      
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Protected Routes', () => {
    test('POST to settings without auth still works (no auth middleware on settings)', async ({ request }) => {
      const response = await request.post('/api/settings', {
        data: [{ key: 'test-key', value: 'test-value' }],
      });
      
      // Settings doesn't require auth - it should process
      expect(response.status()).toBeLessThan(500);
    });

    test('GET /api/auth/me returns user info or redirect', async ({ request }) => {
      const response = await request.get('/api/auth/me');
      
      // Should not be a 500 error
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Seed API', () => {
    test('POST /api/seed initializes database', async ({ request }) => {
      const response = await request.post('/api/seed');
      
      // Seed endpoint should succeed (idempotent)
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Industry Templates API', () => {
    test('GET /api/industry-templates returns templates', async ({ request }) => {
      const response = await request.get('/api/industry-templates');
      
      expect(response.status()).toBeLessThan(500);
      
      const body = await response.json();
      // Should have templates data
      if (Array.isArray(body)) {
        expect(body.length).toBeGreaterThan(0);
      } else if (body && typeof body === 'object') {
        // Could be an object with templates property or similar
        expect(Object.keys(body).length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('API Response Times', () => {
    const endpoints = [
      '/api/health',
      '/api/settings',
      '/api/roles',
    ];

    for (const endpoint of endpoints) {
      test(`${endpoint} responds within 3 seconds`, async ({ request }) => {
        const startTime = Date.now();
        const response = await request.get(endpoint);
        const elapsed = Date.now() - startTime;

        expect(response.status()).toBeLessThan(500);
        expect(elapsed).toBeLessThan(3000);
      });
    }
  });
});
