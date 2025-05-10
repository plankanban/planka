/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

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
      ...idInput,
      required: true,
    },
    labelId: {
      ...idInput,
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
      .getPathToProjectById(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let cardLabel = await CardLabel.qm.getOneByCardIdAndLabelId(card.id, inputs.labelId);

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
