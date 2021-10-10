const bcrypt = require('bcrypt');

const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  INVALID_CURRENT_PASSWORD: {
    invalidCurrentPassword: 'Invalid current password',
  },
  EMAIL_ALREADY_IN_USE: {
    emailAlreadyInUse: 'Email already in use',
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
    userNotFound: {
      responseType: 'notFound',
    },
    invalidCurrentPassword: {
      responseType: 'forbidden',
    },
    emailAlreadyInUse: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.id === currentUser.id) {
      if (!inputs.currentPassword) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
    } else if (!currentUser.isAdmin) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    let user = await sails.helpers.users.getOne(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (
      inputs.id === currentUser.id &&
      !bcrypt.compareSync(inputs.currentPassword, user.password)
    ) {
      throw Errors.INVALID_CURRENT_PASSWORD;
    }

    const values = _.pick(inputs, ['email']);

    user = await sails.helpers.users
      .updateOne(user, values, this.req)
      .intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return {
      item: user,
    };
  },
};
