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
  CARD_RELATION_NOT_FOUND: {
    cardRelationNotFound: 'Card relation not found',
  },
};

module.exports = {
  inputs: {
    cardId: {
      ...idInput,
      required: true,
    },
    id: {
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
    cardRelationNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.cards
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

    const cardRelation = await CardRelation.qm.getOneById(inputs.id);

    if (
      !cardRelation ||
      (cardRelation.cardId !== inputs.cardId && cardRelation.relatedCardId !== inputs.cardId)
    ) {
      throw Errors.CARD_RELATION_NOT_FOUND;
    }

    const deletedCardRelation = await sails.helpers.cardRelations.deleteOne.with({
      record: cardRelation,
      board,
      request: this.req,
    });

    if (!deletedCardRelation) {
      throw Errors.CARD_RELATION_NOT_FOUND;
    }

    return {
      item: deletedCardRelation,
    };
  },
};
