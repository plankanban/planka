module.exports = {
  inputs: {
    userOrId: {
      type: 'ref',
      custom: (value) => _.isObjectLike(value) || _.isString(value),
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

  exits: {
    userAlreadyCardMember: {},
  },

  async fn(inputs) {
    const { userId = inputs.userOrId } = inputs.userOrId;

    const cardMembership = await CardMembership.create({
      userId,
      cardId: inputs.card.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyCardMember')
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

    return cardMembership;
  },
};
