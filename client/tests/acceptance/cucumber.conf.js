const {
  After,
  Before,
  AfterAll,
  BeforeAll,
  setDefaultTimeout,
} = require("@cucumber/cucumber");
const { createSession, closeSession } = require("nightwatch-api");

setDefaultTimeout(60000);
// runs before all scenarios
BeforeAll(async function () {});

// runs before each scenario
Before(async function () {
  await createSession();
});

// runs after each scenario
After(async function () {
  await closeSession();
});

// runs after all scenarios
AfterAll(async function () {});
