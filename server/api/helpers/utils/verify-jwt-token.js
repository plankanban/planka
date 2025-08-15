/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const jwt = require('jsonwebtoken');

module.exports = {
  sync: true,

  inputs: {
    token: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidToken: {},
  },

  fn(inputs) {
    let payload;
    try {
      payload = jwt.verify(inputs.token, sails.config.session.secret);
    } catch (error) {
      throw { invalidToken: error };
    }

    return {
      subject: payload.sub,
      issuedAt: new Date(payload.iat * 1000),
    };
  },
};
