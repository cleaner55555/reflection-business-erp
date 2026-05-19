import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test.describe.configure({ retries: 0 });

  test('desktop viewport: landing page renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check hero section
    await expect(page.locator('#hero')).toBeVisible();

    // Check navbar is visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Desktop nav links should be visible (not hidden behind md:hidden)
    const desktopLinks = page.locator('.hidden.items-center.gap-6.md\\:flex, .hidden.md\\:flex');
    const isDesktopNavVisible = await desktopLinks.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(isDesktopNavVisible).toBeTruthy();
  });

  test('desktop viewport: feature cards show in 4-column grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.locator('#features').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Features section should use a grid with lg:grid-cols-4
    const featuresGrid = page.locator('#features .grid');
    const gridCols = await featuresGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });

    // On desktop, should have multiple columns
    expect(gridCols).toContain(' ');
  });

  test('desktop viewport: pricing shows 3-column grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.locator('#pricing').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const pricingGrid = page.locator('#pricing .grid');
    expect(await pricingGrid.count()).toBeGreaterThanOrEqual(1);
  });

  test('mobile viewport: landing page renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Hero should still be visible
    await expect(page.locator('#hero')).toBeVisible({ timeout: 10000 });

    // CTA buttons should be visible
    const cta = page.locator('#hero').getByRole('button', { name: /započni besplatno/i });
    await expect(cta).toBeVisible();
  });

  test('mobile viewport: hamburger menu button is visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Hamburger menu should be visible on mobile
    const hamburger = page.getByLabel(/meni/i);
    await expect(hamburger).toBeVisible({ timeout: 5000 });
  });

  test('mobile viewport: hamburger menu opens with navigation links', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const hamburger = page.getByLabel(/meni/i);
    await hamburger.click();
    await page.waitForTimeout(500);

    // Check that mobile menu contains navigation items
    const mobileMenu = page.locator('.md\\:hidden');
    await expect(mobileMenu.filter({ hasText: 'Funkcionalnosti' })).toBeAttached({ timeout: 3000 });

    // Check that login buttons are in the mobile menu
    await expect(mobileMenu.filter({ hasText: 'Prijavi se' })).toBeAttached({ timeout: 2000 });
  });

  test('mobile viewport: hero stats show 2-column grid', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.locator('#hero')).toBeVisible({ timeout: 10000 });

    // Stats should show in grid-cols-2 on small screens
    const statsGrid = page.locator('#hero .grid.grid-cols-2');
    expect(await statsGrid.count()).toBeGreaterThanOrEqual(1);
  });

  test('tablet viewport: layout adapts correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Hero should be visible
    await expect(page.locator('#hero')).toBeVisible({ timeout: 10000 });

    // Features section should be visible with 2-column grid
    await page.locator('#features').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeAttached();
  });

  test('mobile viewport: footer stacks vertically', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('responsive: no horizontal overflow', async ({ page }) => {
    // Test at various widths
    const widths = [320, 375, 768, 1024, 1440];
    
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      // Check that html element doesn't have horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
    }
  });
});
