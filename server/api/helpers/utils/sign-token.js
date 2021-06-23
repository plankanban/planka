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
    return jwt.sign(inputs.payload, sails.config.session.secret);
  },
};
