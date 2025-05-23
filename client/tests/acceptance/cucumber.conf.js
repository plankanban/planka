import { After, AfterAll, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from 'playwright';

import Config from './Config.js';

setDefaultTimeout(Config.TIMEOUT);

BeforeAll(async () => {
  global.browser = await chromium.launch(Config.PLAYWRIGHT);
});

Before(async () => {
  global.context = await global.browser.newContext();
  global.page = await global.context.newPage();
});

After(async () => {
  await global.page.close();
  await global.context.close();
});

AfterAll(async () => {
  await global.browser.close();
});
