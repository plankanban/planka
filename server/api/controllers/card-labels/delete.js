const Errors = {
  CARD_NOT_FOUND: {
    notFound: 'Card is not found'
  },
  CARD_LABEL_NOT_FOUND: {
    notFound: 'Card label is not found'
  }
};

module.exports = {
  inputs: {
    cardId: {
      type: 'number',
      required: true
    },
    labelId: {
      type: 'number',
      required: true
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function(inputs, exits) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers
      .getCardToProjectPath(inputs.cardId)
      .intercept('notFound', () => Errors.CARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    let cardLabel = await CardLabel.findOne({
      cardId: inputs.cardId,
      labelId: inputs.labelId
    });

    if (!cardLabel) {
      throw Errors.CARD_LABEL_NOT_FOUND;
    }

    cardLabel = await sails.helpers.deleteCardLabel(cardLabel, board, this.req);

    if (!cardLabel) {
      throw Errors.CARD_LABEL_NOT_FOUND;
    }

    return exits.success({
      item: cardLabel
    });
  }
};
