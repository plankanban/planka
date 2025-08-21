/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { ID_REGEX, MAX_STRING_ID, isIdInRange } = require('../../../utils/validators');

const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

const CURRENT_USER_ID = 'me';

const ID_OR_CURRENT_USER_ID_REGEX = new RegExp(`${ID_REGEX.source}|^${CURRENT_USER_ID}$`);

const isCurrentUserIdOrIdInRange = (value) => value === CURRENT_USER_ID || isIdInRange(value);

module.exports = {
  inputs: {
    id: {
      type: 'string',
      maxLength: MAX_STRING_ID.length,
      regex: ID_OR_CURRENT_USER_ID_REGEX,
      custom: isCurrentUserIdOrIdInRange,
      required: true,
    },
    subscribe: {
      type: 'boolean',
    },
  },

  exits: {
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let user;
    let notificationServices = [];

    if (inputs.id === CURRENT_USER_ID || inputs.id === currentUser.id) {
      user = currentUser;
      notificationServices = await NotificationService.qm.getByUserId(currentUser.id);

      if (inputs.subscribe && this.req.isSocket) {
        sails.sockets.join(this.req, `user:${user.id}`);
      }
    } else {
      if (!sails.helpers.users.isAdminOrProjectOwner(currentUser)) {
        throw Errors.USER_NOT_FOUND; // Forbidden
      }

      user = await User.qm.getOneById(inputs.id);

      if (!user) {
        throw Errors.USER_NOT_FOUND;
      }
    }

    return {
      item: sails.helpers.users.presentOne(user, currentUser),
      included: {
        notificationServices,
      },
    };
  },
};
