module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
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

      sails.helpers.utils.sendWebhooks.with({
        event: 'cardMembershipDelete',
        data: {
          item: cardMembership,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        },
        user: inputs.actorUser,
      });

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

        // TODO: send webhook
      }
    }

    return cardMembership;
  },
};
