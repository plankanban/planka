import Config from '../Config.js';

export default class LoginPage {
  constructor() {
    this.url = `${Config.BASE_URL}/login`;

    this.emailOrUsernameInputSelector = 'input[name="emailOrUsername"]';
    this.passwordInputSelector = 'input[name="password"]';
    this.logInButtonSelector = 'button.primary';
    this.messageSelector = 'div.message > div.content > p';
  }

  async navigate() {
    await page.goto(this.url);
  }

  async login(emailOrUsername, password) {
    await page.fill(this.emailOrUsernameInputSelector, emailOrUsername);
    await page.fill(this.passwordInputSelector, password);
    await page.click(this.logInButtonSelector);
  }

  async getMessage() {
    return page.innerText(this.messageSelector);
  }
}
