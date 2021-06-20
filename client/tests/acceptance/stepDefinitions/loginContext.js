const { Given, When, Then } = require('@cucumber/cucumber');
const { client } = require('nightwatch-api');

Given('user has browsed to the login page', function () {
  return client.url(client.launchUrl + '/login');
});

When(
  'user logs in with username {string} and password {string}',
  function (username, password) {
    return client
      .setValue('input[name=emailOrUsername]', username)
      .setValue('input[name=password]', password)
      .click('.field > button');
  }
);

Then('user should be in dashboard page', async function () {
  return client.assert.containsText('.menu > .item:nth-child(3)', 'Demo Demo');
});
