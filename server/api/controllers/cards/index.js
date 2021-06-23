const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    beforeId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.boards
      .getProjectPath(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const cards = await sails.helpers.boards.getCards(board, inputs.beforeId);
    const cardIds = sails.helpers.utils.mapRecords(cards);

    const cardSubscriptions = await sails.helpers.cardSubscriptions.getMany({
      cardId: cardIds,
      userId: currentUser.id,
    });

    const isSubscribedByCardId = cardSubscriptions.reduce(
      (result, cardSubscription) => ({
        ...result,
        [cardSubscription.cardId]: true,
      }),
      {},
    );

    cards.forEach((card) => {
      card.isSubscribed = isSubscribedByCardId[card.id] || false; // eslint-disable-line no-param-reassign
    });

    const cardMemberships = await sails.helpers.cards.getCardMemberships(cardIds);
    const cardLabels = await sails.helpers.cards.getCardLabels(cardIds);
    const tasks = await sails.helpers.cards.getTasks(cardIds);
    const attachments = await sails.helpers.cards.getAttachments(cardIds);

    return exits.success({
      items: cards,
      included: {
        cardMemberships,
        cardLabels,
        tasks,
        attachments,
      },
    });
  },
};
