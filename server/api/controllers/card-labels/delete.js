const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    labelNotInCard: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, list, board, project } = await sails.helpers.cards
      .getProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let cardLabel = await CardLabel.findOne({
      cardId: inputs.cardId,
      labelId: inputs.labelId,
    });

    if (!cardLabel) {
      throw Errors.LABEL_NOT_IN_CARD;
    }

    cardLabel = await sails.helpers.cardLabels.deleteOne.with({
      project,
      board,
      list,
      card,
      record: cardLabel,
      actorUser: currentUser,
      request: this.req,
    });

    if (!cardLabel) {
      throw Errors.LABEL_NOT_IN_CARD;
    }

    return {
      item: cardLabel,
    };
  },
};
