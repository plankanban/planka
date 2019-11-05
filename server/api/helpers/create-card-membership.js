module.exports = {
  inputs: {
    card: {
      type: 'ref',
      required: true,
    },
    userOrUserId: {
      type: 'ref',
      custom: (value) => _.isPlainObject(value) || _.isString(value),
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs, exits) {
    const { userId = inputs.userOrUserId } = inputs.userOrUserId;

    const cardMembership = await CardMembership.create({
      userId,
      cardId: inputs.card.id,
    })
      .intercept('E_UNIQUE', 'conflict')
      .fetch();

    sails.sockets.broadcast(
      `board:${inputs.card.boardId}`,
      'cardMembershipCreate',
      {
        item: cardMembership,
      },
      inputs.request,
    );

    const cardSubscription = await CardSubscription.create({
      cardId: cardMembership.cardId,
      userId: cardMembership.userId,
      isPermanent: false,
    })
      .tolerate('E_UNIQUE')
      .fetch();

    if (cardSubscription) {
      sails.sockets.broadcast(
        `user:${cardMembership.userId}`,
        'cardUpdate',
        {
          item: {
            id: cardMembership.cardId,
            isSubscribed: true,
          },
        },
        inputs.request,
      );
    }

    return exits.success(cardMembership);
  },
};
