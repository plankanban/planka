const bcrypt = require('bcrypt');
const validator = require('validator');

const Errors = {
  INVALID_EMAIL_OR_USERNAME: {
    invalidEmailOrUsername: 'Invalid email or username',
  },
  INVALID_PASSWORD: {
    invalidPassword: 'Invalid password',
  },
};

module.exports = {
  inputs: {
    emailOrUsername: {
      type: 'string',
      custom: (value) =>
        value.includes('@')
          ? validator.isEmail(value)
          : value.length >= 3 &&
            value.length <= 16 &&
            /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/.test(value),
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidEmailOrUsername: {
      responseType: 'unauthorized',
    },
    invalidPassword: {
      responseType: 'unauthorized',
    },
  },

  async fn(inputs) {
    const user = await sails.helpers.users.getOneByEmailOrUsername(inputs.emailOrUsername);

    if (!user) {
      throw Errors.INVALID_EMAIL_OR_USERNAME;
    }

    if (!bcrypt.compareSync(inputs.password, user.password)) {
      throw Errors.INVALID_PASSWORD;
    }

    return {
      item: sails.helpers.utils.signToken(user.id),
    };
  },
};
