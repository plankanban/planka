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
    isRead: {
      type: 'boolean',
    },
  },

  exits: {
    notificationNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let notification = await Notification.qm.getOneById(inputs.id, {
      userId: currentUser.id,
    });

    if (!notification) {
      throw Errors.NOTIFICATION_NOT_FOUND;
    }

    const values = _.pick(inputs, ['isRead']);

    notification = await sails.helpers.notifications.updateOne.with({
      values,
      record: notification,
      actorUser: currentUser,
      request: this.req,
    });

    if (!notification) {
      throw Errors.NOTIFICATION_NOT_FOUND;
    }

    return {
      item: notification,
    };
  },
};
