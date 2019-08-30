const jwt = require('jsonwebtoken');

module.exports = {
  sync: true,

  inputs: {
    token: {
      type: 'string',
      required: true
    }
  },

  exits: {
    notValid: {}
  },

  fn: function(inputs, exits) {
    let payload;

    try {
      payload = jwt.verify(inputs.token, sails.config.session.secret);
    } catch (unusedError) {
      throw 'notValid';
    }

    return exits.success(payload);
  }
};
