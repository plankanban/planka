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
