const bcrypt = require('bcrypt');

const Errors = {
  EMAIL_NOT_EXIST: {
    unauthorized: 'Email does not exist'
  },
  PASSWORD_NOT_VALID: {
    unauthorized: 'Password is not valid'
  }
};

module.exports = {
  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true
    },
    password: {
      type: 'string',
      required: true
    }
  },

  exits: {
    unauthorized: {
      responseType: 'unauthorized'
    }
  },

  fn: async function(inputs, exits) {
    const user = await sails.helpers.getUser({
      email: inputs.email.toLowerCase()
    });

    if (!user) {
      throw Errors.EMAIL_NOT_EXIST;
    }

    if (!bcrypt.compareSync(inputs.password, user.password)) {
      throw Errors.PASSWORD_NOT_VALID;
    }

    return exits.success({
      item: sails.helpers.signToken(user.id)
    });
  }
};
