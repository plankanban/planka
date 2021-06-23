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

  async fn(inputs) {
    // TODO: allow over HTTP without subscription
    if (!this.req.isSocket) {
      return this.res.badRequest();
    }

    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.BOARD_NOT_FOUND; // Forbidden
      }
    }

    const boardMemberships = await sails.helpers.boards.getBoardMemberships(board.id);

    const userIds = sails.helpers.utils.mapRecords(boardMemberships, 'userId');
    const users = await sails.helpers.users.getMany(userIds);

    const labels = await sails.helpers.boards.getLabels(board.id);
    const lists = await sails.helpers.boards.getLists(board.id);

    const cards = await sails.helpers.boards.getCards(board);
    const cardIds = sails.helpers.utils.mapRecords(cards);

    const cardSubscriptions = await sails.helpers.cardSubscriptions.getMany({
      cardId: cardIds,
      userId: currentUser.id,
    });

    const cardMemberships = await sails.helpers.cards.getCardMemberships(cardIds);
    const cardLabels = await sails.helpers.cards.getCardLabels(cardIds);
    const tasks = await sails.helpers.cards.getTasks(cardIds);
    const attachments = await sails.helpers.cards.getAttachments(cardIds);

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

    sails.sockets.join(this.req, `board:${board.id}`); // TODO: only when subscription needed

    return {
      item: board,
      included: {
        users,
        boardMemberships,
        labels,
        lists,
        cards,
        cardMemberships,
        cardLabels,
        tasks,
        attachments,
        projects: [project],
      },
    };
  },
};
