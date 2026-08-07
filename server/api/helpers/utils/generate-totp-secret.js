/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { authenticator } = require('otplib');

module.exports = {
  sync: true,

  inputs: {},

  fn() {
    return authenticator.generateSecret();
  },
};
