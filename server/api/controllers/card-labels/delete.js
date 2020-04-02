const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  LABEL_NOT_IN_CARD: {
    labelNotInCard: 'Label not in card',
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
    labelNotInCard: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers
      .getCardToProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    let cardLabel = await CardLabel.findOne({
      cardId: inputs.cardId,
      labelId: inputs.labelId,
    });

    if (!cardLabel) {
      throw Errors.LABEL_NOT_IN_CARD;
    }

    cardLabel = await sails.helpers.deleteCardLabel(cardLabel, board, this.req);

    if (!cardLabel) {
      throw Errors.LABEL_NOT_IN_CARD;
    }

    return exits.success({
      item: cardLabel,
    });
  },
};
