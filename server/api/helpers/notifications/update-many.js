module.exports = {
  inputs: {
    recordsOrIds: {
      type: 'json',
      custom: (value) => _.every(value, _.isObjectLike) || _.every(value, _.isString),
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    user: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const criteria = {};

    if (_.every(inputs.recordsOrIds, _.isObjectLike)) {
      criteria.id = sails.helpers.utils.mapRecords(inputs.recordsOrIds);
    } else if (_.every(inputs.recordsOrIds, _.isString)) {
      criteria.id = inputs.recordsOrIds;
    }

    if (inputs.user) {
      criteria.userId = inputs.user.id;
    }

    const notifications = await Notification.update(criteria).set(inputs.values).fetch();

    notifications.forEach((notification) => {
      sails.sockets.broadcast(
        `user:${notification.userId}`,
        'notificationUpdate',
        {
          item: notification,
        },
        inputs.request,
      );
    });

    return notifications;
  },
};
