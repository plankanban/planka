class LoginPage {
  constructor() {
    // url
    this.homeUrl = 'http://localhost:3000';
    this.loginUrl = `${this.homeUrl}/login`;

    this.loginButtonSelector = `//i[@class="right arrow icon"]`;
    this.usernameSelector = `//input[@name='emailOrUsername']`;
    this.passwordSelector = `//input[@name='password']`;
    this.errorMessageSelector = `//div[@class='ui error visible message']`;
    this.userActionSelector = `//span[@class="User_initials__9Wp90"]`;
    this.logOutSelector = `//a[@class="item UserStep_menuItem__5pvtT"][contains(text(),'Log Out')]`;
  }

  async goToLoginUrl() {
    await page.goto(this.loginUrl);
  }

  async logOut() {
    await page.click(this.userActionSelector);
    await page.click(this.logOutSelector);
  }

  async login(username, password) {
    await page.fill(this.usernameSelector, username);
    await page.fill(this.passwordSelector, password);
    await page.click(this.loginButtonSelector);
  }

  async getErrorMessage() {
    return page.innerText(this.errorMessageSelector);
  }
}

module.exports = LoginPage;
