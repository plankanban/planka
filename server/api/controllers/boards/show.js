const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    // TODO: allow over HTTP without subscription
    if (!this.req.isSocket) {
      return this.res.badRequest();
    }

    const { currentUser } = this.req;

    const { board, project } = await sails.helpers
      .getBoardToProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const lists = await sails.helpers.getListsForBoard(board.id);
    const labels = await sails.helpers.getLabelsForBoard(board.id);

    const cards = await sails.helpers.getCardsForBoard(board.id);
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

    sails.sockets.join(this.req, `board:${board.id}`); // TODO: only when subscription needed

    return exits.success({
      item: board,
      included: {
        lists,
        labels,
        cards,
        cardMemberships,
        cardLabels,
        tasks,
        attachments,
      },
    });
  },
};
