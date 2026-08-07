/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { authenticator } = require('otplib');

// Isolated instance: setting `authenticator.options = ...` would mutate the
// shared singleton and bleed into other callers (e.g. enable-totp's first verify,
// where a 90-second-wide acceptance window is too lenient).
const verifier = authenticator.clone();
verifier.options = { window: 1 };

module.exports = {
  sync: true,

  inputs: {
    code: {
      type: 'string',
      required: true,
    },
    secret: {
      type: 'string',
      required: true,
    },
  },

  fn(inputs) {
    try {
      return verifier.verify({
        token: inputs.code.replace(/\s+/g, ''),
        secret: inputs.secret,
      });
    } catch (error) {
      return false;
    }
  },
};
