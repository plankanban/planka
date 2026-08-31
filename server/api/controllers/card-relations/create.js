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
  RELATED_CARD_NOT_FOUND: {
    relatedCardNotFound: 'Related card not found',
  },
  CARD_CANNOT_BE_RELATED_TO_ITSELF: {
    cardCannotBeRelatedToItself: 'Card cannot be related to itself',
  },
  RELATION_ALREADY_EXISTS: {
    relationAlreadyExists: 'Relation already exists',
  },
};

module.exports = {
  inputs: {
    cardId: {
      ...idInput,
      required: true,
    },
    relatedCardId: {
      ...idInput,
      required: true,
    },
    kind: {
      type: 'string',
      isIn: Object.values(CardRelation.Kinds),
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
    relatedCardNotFound: {
      responseType: 'notFound',
    },
    cardCannotBeRelatedToItself: {
      responseType: 'unprocessableEntity',
    },
    relationAlreadyExists: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, board } = await sails.helpers.cards
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

    const relatedPath = await sails.helpers.cards
      .getPathToProjectById(inputs.relatedCardId)
      .intercept('pathNotFound', () => Errors.RELATED_CARD_NOT_FOUND);

    if (relatedPath.card.boardId !== board.id) {
      throw Errors.RELATED_CARD_NOT_FOUND;
    }

    const relatedCard = relatedPath.card;

    const cardRelation = await sails.helpers.cardRelations.createOne
      .with({
        board,
        values: {
          card,
          relatedCard,
          kind: inputs.kind,
        },
        request: this.req,
      })
      .intercept('cardCannotBeRelatedToItself', () => Errors.CARD_CANNOT_BE_RELATED_TO_ITSELF)
      .intercept('relationAlreadyExists', () => Errors.RELATION_ALREADY_EXISTS);

    return {
      item: cardRelation,
    };
  },
};
