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

    const { board, project } = await sails.helpers
      .getBoardToProjectPath(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const cards = await sails.helpers.getCardsForBoard(board, inputs.beforeId);
    const cardIds = sails.helpers.mapRecords(cards);

    const cardSubscriptions = await sails.helpers.getSubscriptionsByUserForCard(
      cardIds,
      currentUser.id,
    );

    const cardMemberships = await sails.helpers.getMembershipsForCard(cardIds);
    const cardLabels = await sails.helpers.getCardLabelsForCard(cardIds);

    const tasks = await sails.helpers.getTasksForCard(cardIds);
    const attachments = await sails.helpers.getAttachmentsForCard(cardIds);

    const isSubscribedByCardId = cardSubscriptions.reduce(
      (result, cardSubscription) => ({
        ...result,
        [cardSubscription.cardId]: true,
      }),
      {},
    );

    cards.map((card) => ({
      ...card,
      isSubscribed: isSubscribedByCardId[card.id] || false,
    }));

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
