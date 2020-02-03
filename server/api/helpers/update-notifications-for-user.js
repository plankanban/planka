module.exports = {
  inputs: {
    ids: {
      type: 'json',
      custom: value => _.isArray(value),
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs, exits) {
    const notifications = await Notification.update({
      id: inputs.ids,
      userId: inputs.user.id,
    })
      .set(inputs.values)
      .fetch();

    notifications.forEach(notification => {
      sails.sockets.broadcast(
        `user:${notification.userId}`,
        'notificationUpdate',
        {
          item: notification,
        },
        inputs.request,
      );
    });

    return exits.success(notifications);
  },
};
