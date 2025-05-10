/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { isPassword } = require('../../../utils/validators');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  EMAIL_ALREADY_IN_USE: {
    emailAlreadyInUse: 'Email already in use',
  },
  USERNAME_ALREADY_IN_USE: {
    usernameAlreadyInUse: 'Username already in use',
  },
  ACTIVE_LIMIT_REACHED: {
    activeLimitReached: 'Active limit reached',
  },
};

module.exports = {
  inputs: {
    email: {
      type: 'string',
      maxLength: 256,
      isEmail: true,
      required: true,
    },
    password: {
      type: 'string',
      maxLength: 256,
      custom: isPassword,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(User.Roles),
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
    username: {
      type: 'string',
      isNotEmptyString: true,
      minLength: 3,
      maxLength: 16,
      regex: /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/,
      allowNull: true,
    },
    phone: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      allowNull: true,
    },
    organization: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      allowNull: true,
    },
    language: {
      type: 'string',
      isIn: User.LANGUAGES,
      allowNull: true,
    },
    subscribeToOwnCards: {
      type: 'boolean',
    },
    subscribeToCardWhenCommenting: {
      type: 'boolean',
    },
    turnOffRecentCardHighlighting: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    emailAlreadyInUse: {
      responseType: 'conflict',
    },
    usernameAlreadyInUse: {
      responseType: 'conflict',
    },
    activeLimitReached: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (sails.config.custom.oidcEnforced) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, [
      'email',
      'password',
      'role',
      'name',
      'username',
      'phone',
      'organization',
      'language',
      'subscribeToOwnCards',
      'subscribeToCardWhenCommenting',
      'turnOffRecentCardHighlighting',
    ]);

    const user = await sails.helpers.users.createOne
      .with({
        values,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('emailAlreadyInUse', () => Errors.EMAIL_ALREADY_IN_USE)
      .intercept('usernameAlreadyInUse', () => Errors.USERNAME_ALREADY_IN_USE)
      .intercept('activeLimitReached', () => Errors.ACTIVE_LIMIT_REACHED);

    return {
      item: sails.helpers.users.presentOne(user, currentUser),
    };
  },
};
