module.exports = {
  inputs: {
    card: {
      type: 'ref',
      required: true
    },
    user: {
      type: 'ref',
      required: true
    },
    values: {
      type: 'json',
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const action = await Action.create({
      ...inputs.values,
      cardId: inputs.card.id,
      userId: inputs.user.id
    }).fetch();

    sails.sockets.broadcast(`board:${inputs.card.boardId}`, 'actionCreate', {
      item: action
    });

    const userIds = await sails.helpers.getSubscriptionUserIdsForCard(
      action.cardId,
      action.userId
    );

    userIds.forEach(async userId => {
      const notification = await Notification.create({
        userId,
        actionId: action.id,
        cardId: action.cardId
      }).fetch();

      sails.sockets.broadcast(`user:${userId}`, 'notificationCreate', {
        item: notification,
        included: {
          users: [inputs.user],
          cards: [inputs.card],
          actions: [action]
        }
      });
    });

    return exits.success(action);
  }
};
