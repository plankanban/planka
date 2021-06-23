const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  USER_ALREADY_CARD_MEMBER: {
    userAlreadyCardMember: 'User already card member',
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
    userNotFound: {
      responseType: 'notFound',
    },
    userAlreadyCardMember: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card } = await sails.helpers.cards
      .getProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    let isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, card.boardId);

    if (!isBoardMember) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    isBoardMember = await sails.helpers.users.isBoardMember(inputs.userId, card.boardId);

    if (!isBoardMember) {
      throw Errors.USER_NOT_FOUND;
    }

    const cardMembership = await sails.helpers.cardMemberships
      .createOne(inputs.userId, card, this.req)
      .intercept('userAlreadyCardMember', () => Errors.USER_ALREADY_CARD_MEMBER);

    return {
      item: cardMembership,
    };
  },
};
