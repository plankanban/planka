const Errors = {
  CARD_NOT_FOUND: {
    notFound: 'Card is not found',
  },
  LABEL_NOT_FOUND: {
    notFound: 'Label is not found',
  },
  CARD_LABEL_EXIST: {
    conflict: 'Card label is already exist',
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
    notFound: {
      responseType: 'notFound',
    },
    conflict: {
      responseType: 'conflict',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { card, project } = await sails.helpers
      .getCardToProjectPath(inputs.cardId)
      .intercept('notFound', () => Errors.CARD_NOT_FOUND);

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
      .intercept('conflict', () => Errors.CARD_LABEL_EXIST);

    return exits.success({
      item: cardLabel,
    });
  },
};
