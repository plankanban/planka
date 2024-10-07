const util = require('util');

class dashboardPage {
  constructor() {
    this.createProjectIconSelector = `.Projects_addTitle__tXhB4`;
    this.projectTitleInputSelector = `input[name="name"]`;
    this.createProjectButtonSelector = `//button[text()="Create project"]`;
    this.projectTitleSelector = `//div[@class="item Header_item__OOEY7 Header_title__l+wMf"][text()="%s"]`;
    this.dashBoardHeaderSelector = `//div[@class="Projects_openTitle__PlaU6"][text()="%s"]`;
  }

  async createProject(project) {
    await page.click(this.createProjectIconSelector);
    await page.fill(this.projectTitleInputSelector, project);
    await page.click(this.createProjectButtonSelector);
  }

  async getProjectTilte() {
    return page.innerText(this.projectTitleSelector);
  }

  async checkForProjectOpenedOrNot() {
    expect(
      await page.locator(util.format(this.dashboardPage.projectTitleInputSelector, project)),
    ).toBeVisible();
  }
}

module.exports = dashboardPage;
