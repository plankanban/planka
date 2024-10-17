const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    userNotCardMember: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, list, board, project } = await sails.helpers.cards
      .getProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let cardMembership = await CardMembership.findOne({
      cardId: inputs.cardId,
      userId: inputs.userId,
    });

    if (!cardMembership) {
      throw Errors.USER_NOT_CARD_MEMBER;
    }

    cardMembership = await sails.helpers.cardMemberships.deleteOne.with({
      project,
      board,
      list,
      card,
      record: cardMembership,
      actorUser: currentUser,
      request: this.req,
    });

    if (!cardMembership) {
      throw Errors.USER_NOT_CARD_MEMBER;
    }

    return {
      item: cardMembership,
    };
  },
};
