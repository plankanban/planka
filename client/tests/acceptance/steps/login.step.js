import assert from 'assert';
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import LoginPage from '../pages/LoginPage.js';
import HomePage from '../pages/HomePage.js';

const loginPage = new LoginPage();
const homePage = new HomePage();

// ---------- GIVEN ----------

Given('the user navigates to the login page', async () => {
  await loginPage.navigate();

  await expect(page).toHaveURL(loginPage.url);
});

Given(
  'the user is logged in with email or username {string} and password {string}',
  async (emailOrUsername, password) => {
    await loginPage.navigate();
    await loginPage.login(emailOrUsername, password);

    await expect(page).toHaveURL(homePage.url);
  },
);

// ---------- WHEN ----------

When(
  'the user logs in with email or username {string} and password {string} via the web UI',
  async (emailOrUsername, password) => {
    await loginPage.login(emailOrUsername, password);
  },
);

When('the user logs out via the web UI', async () => {
  await homePage.logout();
});

// ---------- THEN ----------

Then('the user should be redirected to the home page', async () => {
  await expect(page).toHaveURL(homePage.url);
});

Then('the user should be redirected to the login page', async () => {
  await expect(page).toHaveURL(loginPage.url);
});

Then('the user should see the message {string}', async (expectedMessage) => {
  const message = await loginPage.getMessage();

  assert.strictEqual(
    message,
    expectedMessage,
    `Expected message to be "${expectedMessage}", but received "${message}"`,
  );
});
