module.exports = {
  url: function () {
    return this.api.launchUrl + "/dashboard";
  },
  commands: {
    isDashboardPage: async function () {
      let result = false;
      await this.waitForElementVisible("@dashboardHeader");
      await this.isVisible("@dashboardHeader", (res) => {
        result = res.value;
      });
      return result;
    },
  },
  elements: {
    dashboardHeader: {
      selector: "a.Header_title__3SEjb",
    },
  },
};
