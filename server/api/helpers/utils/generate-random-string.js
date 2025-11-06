/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const crypto = require('crypto');

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

module.exports = {
  sync: true,

  inputs: {
    size: {
      type: 'number',
      required: true,
    },
  },

  fn(inputs) {
    const bytes = crypto.randomBytes(inputs.size);

    let result = '';
    for (let i = 0; i < inputs.size; i += 1) {
      result += CHARS[bytes[i] % 62];
    }

    return result;
  },
};
