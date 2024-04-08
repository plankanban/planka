const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const action = await Action.create({
      ...values,
      cardId: values.card.id,
      userId: values.user.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${values.card.boardId}`,
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

    await Promise.all(
      subscriptionUserIds.map(async (userId) =>
        sails.helpers.notifications.createOne.with({
          values: {
            userId,
            action,
          },
          user: values.user,
          board: inputs.board,
          card: values.card,
        }),
      ),
    );

    await sails.helpers.utils.sendMessage(action, values.user, values.card, inputs.board);

    return action;
  },
};
