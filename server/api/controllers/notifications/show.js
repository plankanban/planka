/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOTIFICATION_NOT_FOUND: {
    notificationNotFound: 'Notification not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notificationNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const notification = await Notification.qm.getOneById(inputs.id, {
      userId: currentUser.id,
    });

    if (!notification) {
      throw Errors.NOTIFICATION_NOT_FOUND;
    }

    const users = notification.creatorUserId
      ? await User.qm.getByIds([notification.creatorUserId])
      : [];

    return {
      item: notification,
      included: {
        users,
      },
    };
  },
};
