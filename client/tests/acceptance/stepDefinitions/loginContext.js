const { Given, When, Then } = require("@cucumber/cucumber");
const { client } = require("nightwatch-api");
const assert = require("assert");

const loginPage = client.page.loginPage();
const dashboardPage = client.page.dashboardPage();

Given("user has browsed to the login page", function () {
  return loginPage.navigate();
});

When(
  "user logs in with username/email {string} and password {string} using the webUI",
  function (username, password) {
    return loginPage.logIn(username, password);
  }
);

Then("the user should be in the dashboard page", async function () {
  const isDashboard = await dashboardPage.isDashboardPage();
  assert.strictEqual(
    isDashboard,
    true,
    "Expected to see dashboard page but not visible"
  );
});
