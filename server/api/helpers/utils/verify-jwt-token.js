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
      throw 'invalidToken';
    }

    return {
      subject: payload.sub,
      issuedAt: new Date(payload.iat * 1000),
    };
  },
};
