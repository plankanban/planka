/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  LIMIT_REACHED: {
    limitReached: 'Limit reached',
  },
};

module.exports = {
  inputs: {
    userId: {
      ...idInput,
      required: true,
    },
    url: {
      type: 'string',
      maxLength: 512,
      required: true,
    },
    format: {
      type: 'string',
      isIn: Object.values(NotificationService.Formats),
      required: true,
    },
  },

  exits: {
    userNotFound: {
      responseType: 'notFound',
    },
    limitReached: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.userId !== currentUser.id) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['url', 'format']);

    const notificationService = await sails.helpers.notificationServices.createOneInUser
      .with({
        values: {
          ...values,
          user: currentUser,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('limitReached', () => Errors.LIMIT_REACHED);

    return {
      item: notificationService,
    };
  },
};
