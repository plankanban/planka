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
    labelNotFound: {
      responseType: 'notFound',
    },
    labelAlreadyInCard: {
      responseType: 'conflict',
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

    const label = await Label.qm.getOneById(inputs.labelId, {
      boardId: board.id,
    });

    if (!label) {
      throw Errors.LABEL_NOT_FOUND;
    }

    const cardLabel = await sails.helpers.cardLabels.createOne
      .with({
        project,
        board,
        list,
        values: {
          card,
          label,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('labelAlreadyInCard', () => Errors.LABEL_ALREADY_IN_CARD);

    return {
      item: cardLabel,
    };
  },
};
