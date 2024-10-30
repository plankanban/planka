const recordsOrIdsValidator = (value) =>
  _.every(value, _.isPlainObject) || _.every(value, _.isString);

module.exports = {
  inputs: {
    recordsOrIds: {
      type: 'json',
      custom: recordsOrIdsValidator,
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const criteria = {
      userId: inputs.actorUser.id,
    };

    if (_.every(inputs.recordsOrIds, _.isPlainObject)) {
      criteria.id = sails.helpers.utils.mapRecords(inputs.recordsOrIds);
    } else if (_.every(inputs.recordsOrIds, _.isString)) {
      criteria.id = inputs.recordsOrIds;
    }

    const notifications = await Notification.update(criteria)
      .set({ ...values })
      .fetch();

    notifications.forEach((notification) => {
      sails.sockets.broadcast(
        `user:${notification.userId}`,
        'notificationUpdate',
        {
          item: notification,
        },
        inputs.request,
      );

      // TODO: with prevData?
      sails.helpers.utils.sendWebhooks.with({
        event: 'notificationUpdate',
        data: {
          item: notification,
        },
        user: inputs.actorUser,
      });
    });

    return notifications;
  },
};
