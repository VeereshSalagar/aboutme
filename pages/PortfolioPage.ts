import { Page, Locator, expect } from '@playwright/test';

export class PortfolioPage {
  readonly page: Page;

  // ===== Locators =====
  readonly brandLogo: Locator;
  readonly mainNav: Locator;
  readonly navAboutLink: Locator;
  readonly navProjectsLink: Locator;
  readonly heroHeading: Locator;
  readonly heroGithubLink: Locator;
  readonly experienceHeading: Locator;
  readonly jobTitleHeading: Locator;
  readonly companyNameText: Locator;
  readonly footer: Locator;
  readonly copyrightText: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation Locators
    this.mainNav = page.getByRole('navigation');
    this.brandLogo = page.getByRole('link', { name: 'Veeresh.' });
    this.navAboutLink = this.mainNav.getByRole('link', { name: 'About', exact: true });
    this.navProjectsLink = this.mainNav.getByRole('link', { name: 'Projects', exact: true });

    // Hero Locators
    this.heroHeading = page.getByRole('heading', { name: 'Veeresh Salagar', level: 1 });
    this.heroGithubLink = page.getByRole('link', { name: 'GitHub' }).first();

    // Experience Locators
    this.experienceHeading = page.getByRole('heading', { name: 'Experience', level: 2 });
    this.jobTitleHeading = page.getByRole('heading', { name: 'Software IV&V Engineer', level: 3 });
    this.companyNameText = page.getByText('LRDE (DRDO) via GVR Technolabs');

    // Footer Locators
    this.footer = page.getByRole('contentinfo');
    this.copyrightText = page.getByText('© 2026 Veeresh Salagar. All Rights Reserved.');
  }

  // ===== Actions =====
  async navigateToPortfolio() {
  await this.page.goto('./', { waitUntil: 'domcontentloaded' });
}

  // ===== Assertions =====
  async verifyMainNavigation() {
    await expect(this.brandLogo).toBeVisible();
    await expect(this.brandLogo).toHaveText('Veeresh.');
    await expect(this.navAboutLink).toBeVisible();
    await expect(this.navProjectsLink).toBeVisible();
  }

  async verifyHeroSection(expectedGithubUrl: string) {
    await expect(this.heroHeading).toBeVisible();
    await expect(this.heroGithubLink).toHaveAttribute('href', expectedGithubUrl);
  }

  async verifyExperienceSection() {
    await expect(this.experienceHeading).toBeVisible();
    await expect(this.jobTitleHeading).toBeVisible();
    await expect(this.companyNameText).toBeVisible();
  }

  async verifyFooter() {
    await expect(this.copyrightText).toBeVisible();
  }
}