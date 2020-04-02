const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  LABEL_NOT_FOUND: {
    labelNotFound: 'Label not found',
  },
  LABEL_ALREADY_IN_CARD: {
    labelAlreadyInCard: 'Label already in card',
  },
};

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    labelId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    labelNotFound: {
      responseType: 'notFound',
    },
    labelAlreadyInCard: {
      responseType: 'conflict',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { card, project } = await sails.helpers
      .getCardToProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    const label = await Label.findOne({
      id: inputs.labelId,
      boardId: card.boardId,
    });

    if (!label) {
      throw Errors.LABEL_NOT_FOUND;
    }

    const cardLabel = await sails.helpers
      .createCardLabel(card, label, this.req)
      .intercept('labelAlreadyInCard', () => Errors.LABEL_ALREADY_IN_CARD);

    return exits.success({
      item: cardLabel,
    });
  },
};
