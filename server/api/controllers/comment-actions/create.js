const Errors = {
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
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card } = await sails.helpers.cards
      .getProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, card.boardId);

    if (!isBoardMember) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    const values = {
      type: Action.Types.COMMENT_CARD,
      data: _.pick(inputs, ['text']),
    };

    const action = await sails.helpers.actions.createOne(values, currentUser, card, this.req);

    return {
      item: action,
    };
  },
};
