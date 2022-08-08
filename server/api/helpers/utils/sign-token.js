const jwt = require('jsonwebtoken');

module.exports = {
  sync: true,

  inputs: {
    payload: {
      type: 'json',
      required: true,
    },
  },

  fn(inputs) {
    return jwt.sign({ sub: inputs.payload }, sails.config.session.secret, {
      expiresIn: `${process.env.ACCESS_TOKEN_EXPIRES}d`,
    });
  },
};
