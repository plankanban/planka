module.exports = {
  url: function () {
    return this.api.launchUrl + "/login";
  },
  commands: {
    logIn: function (email, password) {
      return this.waitForElementVisible("@emailInput")
        .setValue("@emailInput", email)
        .waitForElementVisible("@passwordInput")
        .setValue("@passwordInput", password)
        .waitForElementVisible("@loginBtn")
        .click("@loginBtn");
    },
  },
  elements: {
    emailInput: {
      selector: "input[name=emailOrUsername]",
    },
    passwordInput: {
      selector: "input[name=password]",
    },
    loginBtn: {
      selector: "form button",
    },
  },
};
