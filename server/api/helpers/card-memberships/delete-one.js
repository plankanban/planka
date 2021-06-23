module.exports = {
  inputs: {
    record: {
      type: 'ref',
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
    const cardMembership = await CardMembership.destroyOne(inputs.record.id);

    if (cardMembership) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'cardMembershipDelete',
        {
          item: cardMembership,
        },
        inputs.request,
      );

      const cardSubscription = await CardSubscription.destroyOne({
        cardId: cardMembership.cardId,
        userId: cardMembership.userId,
        isPermanent: false,
      });

      if (cardSubscription) {
        sails.sockets.broadcast(`user:${cardMembership.userId}`, 'cardUpdate', {
          item: {
            id: cardMembership.cardId,
            isSubscribed: false,
          },
        });
      }
    }

    return cardMembership;
  },
};
