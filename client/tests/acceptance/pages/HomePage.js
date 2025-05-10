import Config from '../Config.js';

export default class HomePage {
  constructor() {
    this.url = Config.BASE_URL;

    this.userActionSelector = 'div.menu > a:last-child';
    this.logOutSelector = 'a:has-text("Log Out")';
  }

  async navigate() {
    await page.goto(this.url);
  }

  async logout() {
    await page.click(this.userActionSelector);
    await page.click(this.logOutSelector);
  }
}
