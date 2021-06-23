const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  USER_NOT_CARD_MEMBER: {
    userNotCardMember: 'User not card member',
  },
};

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    userNotCardMember: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.cards
      .getProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    let cardMembership = await CardMembership.findOne({
      cardId: inputs.cardId,
      userId: inputs.userId,
    });

    if (!cardMembership) {
      throw Errors.USER_NOT_CARD_MEMBER;
    }

    cardMembership = await sails.helpers.cardMemberships.deleteOne(cardMembership, board, this.req);

    if (!cardMembership) {
      throw Errors.USER_NOT_CARD_MEMBER;
    }

    return {
      item: cardMembership,
    };
  },
};
