import { test } from '@playwright/test';
import { PortfolioPage } from '../pages/PortfolioPage';

test.describe('Portfolio Core Validation (POM)', () => {
  let portfolioPage: PortfolioPage;

  test.beforeEach(async ({ page }) => {
    portfolioPage = new PortfolioPage(page);
    await portfolioPage.navigateToPortfolio();
  });

  test('should load the page and verify main navigation', async () => {
    await portfolioPage.verifyMainNavigation();
  });

  test('should display hero section and correct social links', async () => {
    await portfolioPage.verifyHeroSection('https://github.com/VeereshSalagar');
  });

  test('should render Experience section without strict mode errors', async () => {
    await portfolioPage.verifyExperienceSection();
  });

  test('should render the footer and copyright info', async () => {
    await portfolioPage.verifyFooter();
  });
});