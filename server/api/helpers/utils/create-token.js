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

    return jwt.sign(
      {
        iat,
        sub: inputs.subject,
        exp: iat + sails.config.custom.tokenExpiresIn * 24 * 60 * 60,
      },
      sails.config.session.secret,
      {
        keyid: uuid(),
      },
    );
  },
};
