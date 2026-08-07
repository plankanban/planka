/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { authenticator } = require('otplib');

module.exports = {
  sync: true,

  inputs: {
    account: {
      type: 'string',
      required: true,
    },
    secret: {
      type: 'string',
      required: true,
    },
    issuer: {
      type: 'string',
    },
  },

  fn(inputs) {
    return authenticator.keyuri(inputs.account, inputs.issuer || 'Planka', inputs.secret);
  },
};
