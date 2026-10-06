import { test, expect } from '@playwright/test';

const VISITOR_URL =
  'https://veereshsalagar.github.io/aboutme/visitor/';

const BACKEND_URL =
  'https://volunteers-backend-35oe.onrender.com';

test.describe('Volunteer API + UI Validation', () => {

  test('should submit volunteer request and validate data in Admin table', async ({
    page,
    request,
  }) => {

    // ---------------------------------------------------------
    // Test data
    // ---------------------------------------------------------

    const timestamp = Date.now();

    const volunteer = {
      name: `Playwright Test ${timestamp}`,
      email: `playwright.${timestamp}@example.com`,
      mobileNumber: `9${String(timestamp).slice(-9)}`,
    };

    // ---------------------------------------------------------
    // 1. Open Visitor page
    // ---------------------------------------------------------

    await page.goto(VISITOR_URL, {
      waitUntil: 'domcontentloaded',
    });

    await expect(
      page.getByRole('heading', {
        name: 'Volunteer Registration',
      })
    ).toBeVisible();

    // ---------------------------------------------------------
    // 2. Fill volunteer form
    // ---------------------------------------------------------

    await page.getByPlaceholder('Enter Name')
      .fill(volunteer.name);

    await page.getByPlaceholder('Enter Email')
      .fill(volunteer.email);

    await page.getByPlaceholder('Enter Mobile')
      .fill(volunteer.mobileNumber);

    // ---------------------------------------------------------
    // 3. Capture the POST API request
    // ---------------------------------------------------------

    const postRequestPromise = page.waitForRequest(
      request =>
        request.method() === 'POST' &&
        request.url() === `${BACKEND_URL}/volunteers`
    );

    const postResponsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        response.url() === `${BACKEND_URL}/volunteers`
    );

    // ---------------------------------------------------------
    // 4. Submit form
    // ---------------------------------------------------------

    await page.getByRole('button', {
      name: 'Submit',
    }).click();

    // ---------------------------------------------------------
    // 5. Validate POST request payload
    // ---------------------------------------------------------

    const postRequest = await postRequestPromise;

    const requestBody = postRequest.postDataJSON();

    expect(requestBody).toEqual({
      name: volunteer.name,
      email: volunteer.email,
      mobileNumber: volunteer.mobileNumber,
    });

    console.log('POST request payload:', requestBody);

    // ---------------------------------------------------------
    // 6. Validate POST API response
    // ---------------------------------------------------------

    const postResponse = await postResponsePromise;

    expect(postResponse.ok()).toBeTruthy();

    console.log(
      'POST API status:',
      postResponse.status()
    );

    // ---------------------------------------------------------
    // 7. Validate success message
    // ---------------------------------------------------------

    await expect(
      page.getByText('Registration submitted successfully!')
    ).toBeVisible();

    // ---------------------------------------------------------
    // 8. Open Admin Portal
    // ---------------------------------------------------------

    await page.getByRole('link', {
      name: 'Admin Portal',
    }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Admin Login',
      })
    ).toBeVisible();

    // ---------------------------------------------------------
    // 9. Login as Admin
    // ---------------------------------------------------------

    const adminPassword = "salaga@784";

    if (!adminPassword) {
      throw new Error(
        'ADMIN_PASSWORD environment variable is not set.'
      );
    }

    await page.getByPlaceholder(
      'Enter Admin Password'
    ).fill(adminPassword);

    await page.getByRole('button', {
      name: 'Login',
    }).click();

    // ---------------------------------------------------------
    // 10. Verify Admin Dashboard
    // ---------------------------------------------------------

    await expect(
      page.getByRole('heading', {
        name: 'Admin Dashboard',
      })
    ).toBeVisible();

    // ---------------------------------------------------------
    // 11. Validate GET /volunteers API
    // ---------------------------------------------------------

    const volunteersResponsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'GET' &&
        response.url() === `${BACKEND_URL}/volunteers`
    );

    // The AdminDashboard loads this API when entering /admin.
    const volunteersResponse =
      await volunteersResponsePromise;

    expect(volunteersResponse.ok()).toBeTruthy();

    const volunteers = await volunteersResponse.json();

    expect(Array.isArray(volunteers)).toBeTruthy();

    console.log(
      `GET /volunteers returned ${volunteers.length} records`
    );

    // ---------------------------------------------------------
    // 12. Validate our submitted record from API response
    // ---------------------------------------------------------

    const apiRecord = volunteers.find(
      (v: {
        name?: string;
        email?: string;
        mobileNumber?: string;
      }) =>
        v.email === volunteer.email
    );

    expect(apiRecord).toBeDefined();

    expect(apiRecord.name).toBe(volunteer.name);
    expect(apiRecord.email).toBe(volunteer.email);
    expect(apiRecord.mobileNumber).toBe(
      volunteer.mobileNumber
    );

    console.log(
      'API record validated:',
      apiRecord
    );

    // ---------------------------------------------------------
    // 13. Validate data in Admin UI table
    // ---------------------------------------------------------

    const row = page.locator('tbody tr').filter({
      hasText: volunteer.email,
    });

    await expect(row).toHaveCount(1);

    await expect(row).toContainText(volunteer.name);
    await expect(row).toContainText(volunteer.email);
    await expect(row).toContainText(
      volunteer.mobileNumber
    );

    console.log(
      'Admin UI table record validated successfully.'
    );
  });
});