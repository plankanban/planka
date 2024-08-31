const { Given, When, Then } = require('@cucumber/cucumber');

// import expect for assertion
const { expect } = require('@playwright/test');

// import assert
const assert = require('assert');

const LoginPage = require('../pageObjects/LoginPage');

const loginPage = new LoginPage();

Given('user has browsed to the login page', async function () {
  await loginPage.goToLoginUrl();
  await expect(page).toHaveURL(loginPage.loginUrl);
});

Given(
  'user has logged in with email {string} and password {string}',
  async function (username, password) {
    await loginPage.goToLoginUrl();
    await loginPage.login(username, password);
    await expect(page).toHaveURL(loginPage.homeUrl);
  },
);

When(
  'user logs in with username {string} and password {string} using the webUI',
  async function (username, password) {
    await loginPage.login(username, password);
  },
);

Then('the user should be in dashboard page', async function () {
  await expect(page).toHaveURL(loginPage.homeUrl);
});

Then('user should see the error message {string}', async function (errorMessage) {
  const actualErrorMessage = await loginPage.getErrorMessage();
  assert.equal(
    actualErrorMessage,
    errorMessage,
    `Expected message to be "${errorMessage}" but receive "${actualErrorMessage}"`,
  );
});

When('user logs out using the webUI', async function () {
  await loginPage.logOut();
});

Then('the user should be in the login page', async function () {
  await expect(page).toHaveURL(loginPage.loginUrl);
});
