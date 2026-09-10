import { test } from '@playwright/test';

test('debug GitHub Pages baseURL navigation', async ({ page }) => {
  console.log('BASE URL:', test.info().project.use.baseURL);

  const response = await page.goto('/', {
    waitUntil: 'domcontentloaded'
  });

  console.log('STATUS:', response?.status());
  console.log('FINAL URL:', page.url());
  console.log('TITLE:', await page.title());

  console.log(
    'BODY:',
    (await page.locator('body').innerText()).substring(0, 500)
  );
});