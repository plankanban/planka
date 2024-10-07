const { When, Then } = require('@cucumber/cucumber');

const DashboardPage = require('../pageObjects/DashboardPage');

const dashboardPage = new DashboardPage();

When('the user creates a project with name {string} using the webUI', async function (project) {
  await dashboardPage.createProject(project);
});

Then('the created project {string} should be opened', async function (project) {
  dashboardPage.checkForProjectOpenedOrNot(project);
});
