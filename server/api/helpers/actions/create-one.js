module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const action = await Action.create({
      ...inputs.values,
      cardId: inputs.card.id,
      userId: inputs.user.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${inputs.card.boardId}`,
      'actionCreate',
      {
        item: action,
      },
      inputs.request,
    );

    const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(
      action.cardId,
      action.userId,
    );

    subscriptionUserIds.forEach(async (userId) => {
      await sails.helpers.notifications.createOne(userId, action);
    });

    return action;
  },
};
