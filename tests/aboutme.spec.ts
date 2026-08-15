import { test, expect } from '@playwright/test';

test.describe('Portfolio Core Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to local port with domcontentloaded
    await page.goto('./', { waitUntil: 'domcontentloaded' });
  });

  test('should load the page and verify main navigation', async ({ page }) => {
    const nav = page.getByRole('navigation');
    
    // Check main brand link
    await expect(page.getByRole('link', { name: 'Veeresh.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Veeresh.' })).toHaveText('Veeresh Salagar.');
    // Check exact navigation links inside the nav bar
    await expect(nav.getByRole('link', { name: 'About', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Projects', exact: true })).toBeVisible();
  });

  test('should display hero section and correct social links', async ({ page }) => {
    // Verify main introductory text
    await expect(page.getByRole('heading', { name: 'Veeresh Salagar', level: 1 })).toBeVisible();
    
    // Specifically target the first GitHub link (in the hero section)
    const githubLink = page.getByRole('link', { name: 'GitHub' }).first();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/VeereshSalagar');
  });

  test('should render Experience section without strict mode errors', async ({ page }) => {
    // Verify Experience heading
    await expect(page.getByRole('heading', { name: 'Experience', level: 2 })).toBeVisible();
    
    // Explicitly target heading level 3
    await expect(page.getByRole('heading', { name: 'Software IV&V Engineer', level: 3 })).toBeVisible();
    await expect(page.getByText('LRDE (DRDO) via GVR Technolabs')).toBeVisible();
  });

  test('should render the footer and copyright info', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    
    // Verify copyright text exists inside the footer
    await expect(footer.getByText('© 2026 Veeresh Salagar. All Rights Reserved.')).toBeVisible();
  });
});