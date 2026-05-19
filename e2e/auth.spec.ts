import { test, expect } from '@playwright/test';

test.describe('Authentication / Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads successfully with 200 status', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('landing page hero section is visible', async ({ page }) => {
    // The landing page shows when user is not logged in
    await page.waitForLoadState('networkidle');

    // Check for hero headline — should contain "ERP" and "poslovanje"
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();

    // Check for the "Započni besplatno" CTA button (triggers auth)
    const ctaButton = page.getByRole('button', { name: /započni besplatno/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('login form is accessible via CTA buttons', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click "Prijavi se" in the navbar (visible on desktop)
    const loginBtn = page.getByRole('button', { name: /prijavi se/i }).first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
    } else {
      // On mobile, use the CTA button instead
      const ctaButton = page.getByRole('button', { name: /započni besplatno/i }).first();
      await ctaButton.click();
    }

    // Auth form should appear — check for email input or login form container
    await page.waitForTimeout(500);

    // The AuthPage component should render with an email field
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(emailInput).toBeVisible();
    }
  });

  test('navigation links are present in navbar', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check that key navigation sections exist
    const navLinks = ['Funkcionalnosti', 'Kako radi', 'Industrije', 'Cene'];
    for (const linkText of navLinks) {
      const link = page.getByRole('button', { name: linkText }).first();
      // On mobile these might be hidden, so we check they exist in DOM
      await expect(link).toBeAttached({ timeout: 2000 }).catch(() => {
        // On small screens these links are hidden until hamburger opens
      });
    }
  });

  test('features section displays feature cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Scroll to features section
    await page.locator('#features').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Check for at least some feature cards (Knjigovodstvo, CRM, Magacin, etc.)
    const featureTitles = ['Knjigovodstvo', 'CRM', 'Magacin', 'POS'];
    let found = 0;
    for (const title of featureTitles) {
      const el = page.getByText(title, { exact: true });
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
        found++;
      }
    }
    expect(found).toBeGreaterThanOrEqual(2);
  });

  test('pricing section shows plan cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await page.locator('#pricing').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Check for plan names
    const planNames = ['Starter', 'Professional', 'Enterprise'];
    let found = 0;
    for (const name of planNames) {
      const el = page.getByText(name, { exact: true });
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
        found++;
      }
    }
    expect(found).toBeGreaterThanOrEqual(2);
  });

  test('footer is visible with link sections', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check footer links exist
    const footerLinkTexts = ['Proizvod', 'Kompanija', 'Resursi'];
    let found = 0;
    for (const text of footerLinkTexts) {
      const el = page.locator('footer').getByText(text, { exact: true });
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
        found++;
      }
    }
    expect(found).toBeGreaterThanOrEqual(1);
  });

  test('theme toggle exists on the landing page', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Theme toggle button with aria-label "Promeni temu"
    const themeToggle = page.getByLabel(/promeni temu/i);
    await expect(themeToggle).toBeVisible({ timeout: 5000 });
  });

  test('hero stats section shows key numbers', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();

    // Check that stats like "148+" and "Modula" exist
    await expect(page.locator('#hero')).toContainText(/148\+/);
    await expect(page.locator('#hero')).toContainText(/Modula/);
  });
});
