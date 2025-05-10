/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  ACTIVE_LIMIT_REACHED: {
    activeLimitReached: 'Active limit reached',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(User.Roles),
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    avatar: {
      type: 'json',
      custom: _.isNull,
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
    enableFavoritesByDefault: {
      type: 'boolean',
    },
    defaultEditorMode: {
      type: 'string',
      isIn: Object.values(User.EditorModes),
    },
    defaultHomeView: {
      type: 'string',
      isIn: Object.values(User.HomeViews),
    },
    defaultProjectsOrder: {
      type: 'string',
      isIn: Object.values(User.ProjectOrders),
    },
    isDeactivated: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    activeLimitReached: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const availableInputKeys = ['id', 'name', 'avatar', 'phone', 'organization'];
    if (inputs.id === currentUser.id) {
      availableInputKeys.push(...User.PERSONAL_FIELD_NAMES);
    } else if (currentUser.role === User.Roles.ADMIN) {
      availableInputKeys.push('role', 'isDeactivated');
    } else {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    if (_.difference(Object.keys(inputs), availableInputKeys).length > 0) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let user = await User.qm.getOneById(inputs.id);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    // TODO: refactor
    if (user.email === sails.config.custom.defaultAdminEmail) {
      if (inputs.role || inputs.name) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    } else if (user.isSsoUser) {
      if (!sails.config.custom.oidcIgnoreRoles && inputs.role) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }

      if (inputs.name) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const values = {
      ..._.pick(inputs, [
        'role',
        'name',
        'avatar',
        'phone',
        'organization',
        'language',
        'subscribeToOwnCards',
        'subscribeToCardWhenCommenting',
        'turnOffRecentCardHighlighting',
        'enableFavoritesByDefault',
        'defaultEditorMode',
        'defaultHomeView',
        'defaultProjectsOrder',
        'isDeactivated',
      ]),
    };

    user = await sails.helpers.users.updateOne
      .with({
        values,
        record: user,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('activeLimitReached', () => Errors.ACTIVE_LIMIT_REACHED);

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return {
      item: sails.helpers.users.presentOne(user, currentUser),
    };
  },
};
