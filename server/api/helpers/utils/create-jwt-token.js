/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');

module.exports = {
  sync: true,

  inputs: {
    subject: {
      type: 'json',
      required: true,
    },
    issuedAt: {
      type: 'ref',
    },
    expiresIn: {
      type: 'number',
    },
  },

  fn(inputs) {
    const { issuedAt = new Date(), expiresIn = sails.config.custom.tokenExpiresIn } = inputs;

    const iat = Math.floor(issuedAt / 1000);
    const exp = iat + expiresIn;

    const payload = {
      iat,
      exp,
      sub: inputs.subject,
    };

    const token = jwt.sign(payload, sails.config.session.secret, {
      keyid: uuid(),
    });

    return {
      token,
      payload,
    };
  },
};
