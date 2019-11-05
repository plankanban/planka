const bcrypt = require('bcrypt');

const Errors = {
  USER_NOT_FOUND: {
    notFound: 'User is not found',
  },
  CURRENT_PASSWORD_NOT_VALID: {
    forbidden: 'Current password is not valid',
  },
  USER_EXIST: {
    conflict: 'User is already exist',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    email: {
      type: 'string',
      isEmail: true,
      required: true,
    },
    currentPassword: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  exits: {
    notFound: {
      responseType: 'notFound',
    },
    forbidden: {
      responseType: 'forbidden',
    },
    conflict: {
      responseType: 'conflict',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    if (inputs.id === currentUser.id) {
      if (!inputs.currentPassword) {
        throw Errors.CURRENT_PASSWORD_NOT_VALID;
      }
    } else if (!currentUser.isAdmin) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    let user = await sails.helpers.getUser(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (
      inputs.id === currentUser.id
      && !bcrypt.compareSync(inputs.currentPassword, user.password)
    ) {
      throw Errors.CURRENT_PASSWORD_NOT_VALID;
    }

    const values = _.pick(inputs, ['email']);

    user = await sails.helpers
      .updateUser(user, values, this.req)
      .intercept('conflict', () => Errors.USER_EXIST);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return exits.success({
      item: user.email,
    });
  },
};
