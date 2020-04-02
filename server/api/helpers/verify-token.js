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

  fn(inputs, exits) {
    let payload;

    try {
      payload = jwt.verify(inputs.token, sails.config.session.secret);
    } catch (error) {
      throw 'invalidToken';
    }

    return exits.success(payload);
  },
};
