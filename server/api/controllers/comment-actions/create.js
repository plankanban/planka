const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
};

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    text: {
      type: 'string',
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
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, card } = await sails.helpers.cards
      .getProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR && !boardMembership.canComment) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const comment = _.pick(inputs, ['text']);
    const values = {
      type: Action.Types.COMMENT_CARD,
      data: comment,
    };

    const boardMemberships = await sails.helpers.boards.getBoardMemberships(board.id);
    const userIds = sails.helpers.utils.mapRecords(boardMemberships, 'userId');
    const users = await sails.helpers.users.getMany(userIds);
    const mentions = await sails.helpers.mentions.getMentions(comment.text, users);

    const action = await sails.helpers.actions.createOne.with({
      board,
      values: {
        ...values,
        card,
        user: currentUser,
      },
      request: this.req,
      notifyUserIds: mentions,
    });

    return {
      item: action,
    };
  },
};
