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
  },

  fn(inputs) {
    const { issuedAt = new Date() } = inputs;

    const iat = Math.floor(issuedAt / 1000);
    const exp = iat + sails.config.custom.tokenExpiresIn * 24 * 60 * 60;

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
