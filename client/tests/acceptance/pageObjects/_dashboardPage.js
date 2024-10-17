class dashboardPage {
  constructor() {
    this.createProjectIconSelector = `.Projects_addTitle__tXhB4`;
    this.projectTitleInputSelector = `input[name="name"]`;
    this.createProjectButtonSelector = `//button[text()="Create project"]`;
    this.projectTitleSelector = `//div[@class="item Header_item__OOEY7 Header_title__l+wMf"][text()="%s"]`;
  }

  async createProject(project) {
    await page.click(this.createProjectIconSelector);
    await page.fill(this.projectTitleInputSelector, project);
    await page.click(this.createProjectButtonSelector);
  }
}

module.exports = dashboardPage;
