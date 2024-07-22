const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.user) && !_.isString(value.userId)) {
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
    actorUser: {
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
    const { values } = inputs;

    if (values.user) {
      values.userId = values.user.id;
    }

    const cardMembership = await CardMembership.create({
      ...values,
      cardId: values.card.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyCardMember')
      .fetch();

    sails.sockets.broadcast(
      `board:${values.card.boardId}`,
      'cardMembershipCreate',
      {
        item: cardMembership,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'cardMembershipCreate',
      data: {
        item: cardMembership,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      },
      user: inputs.actorUser,
    });

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

      // TODO: send webhooks
    }

    return cardMembership;
  },
};
