const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
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

    const isBoardMember = await sails.helpers.users.isBoardMember(inputs.userId, board.id);

    if (!isBoardMember) {
      throw Errors.USER_NOT_FOUND;
    }

    const cardMembership = await sails.helpers.cardMemberships.createOne
      .with({
        project,
        board,
        list,
        values: {
          card,
          userId: inputs.userId,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('userAlreadyCardMember', () => Errors.USER_ALREADY_CARD_MEMBER);

    return {
      item: cardMembership,
    };
  },
};
