const bcrypt = require('bcrypt');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  INVALID_CURRENT_PASSWORD: {
    invalidCurrentPassword: 'Invalid current password',
  },
  USERNAME_ALREADY_IN_USE: {
    usernameAlreadyInUse: 'Username already in use',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    username: {
      isNotEmptyString: true,
      minLength: 3,
      maxLength: 16,
      regex: /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/,
      allowNull: true,
    },
    currentPassword: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    invalidCurrentPassword: {
      responseType: 'forbidden',
    },
    usernameAlreadyInUse: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.id !== currentUser.id && !currentUser.isAdmin) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    let user = await sails.helpers.users.getOne(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (user.email === sails.config.custom.defaultAdminEmail) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (user.isSso) {
      if (!sails.config.custom.oidcIgnoreUsername) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    } else if (inputs.id === currentUser.id) {
      if (!inputs.currentPassword || !bcrypt.compareSync(inputs.currentPassword, user.password)) {
        throw Errors.INVALID_CURRENT_PASSWORD;
      }
    }

    const values = _.pick(inputs, ['username']);

    user = await sails.helpers.users.updateOne
      .with({
        values,
        record: user,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('usernameAlreadyInUse', () => Errors.USERNAME_ALREADY_IN_USE);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return {
      item: user,
    };
  },
};
