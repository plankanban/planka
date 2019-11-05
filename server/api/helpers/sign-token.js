const jwt = require('jsonwebtoken');

module.exports = {
  sync: true,

  inputs: {
    payload: {
      type: 'json',
      required: true,
    },
  },

  fn(inputs, exits) {
    const token = jwt.sign(inputs.payload, sails.config.session.secret);

    return exits.success(token);
  },
};
