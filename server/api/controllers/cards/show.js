const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
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
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, project } = await sails.helpers.cards
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, card.boardId);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.CARD_NOT_FOUND; // Forbidden
      }
    }

    card.isSubscribed = await sails.helpers.users.isCardSubscriber(currentUser.id, card.id);

    const cardMemberships = await sails.helpers.cards.getCardMemberships(card.id);
    const cardLabels = await sails.helpers.cards.getCardLabels(card.id);
    const tasks = await sails.helpers.cards.getTasks(card.id);
    const attachments = await sails.helpers.cards.getAttachments(card.id);

    return {
      item: card,
      included: {
        cardMemberships,
        cardLabels,
        tasks,
        attachments,
      },
    };
  },
};
