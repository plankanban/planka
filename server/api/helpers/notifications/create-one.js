module.exports = {
  inputs: {
    userOrId: {
      type: 'ref',
      custom: (value) => _.isObjectLike(value) || _.isString(value),
      required: true,
    },
    action: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { userId = inputs.userOrId } = inputs.userOrId;

    const notification = await Notification.create({
      userId,
      actionId: inputs.action.id,
      cardId: inputs.action.cardId,
    }).fetch();

    sails.sockets.broadcast(`user:${userId}`, 'notificationCreate', {
      item: notification,
    });

    return notification;
  },
};
