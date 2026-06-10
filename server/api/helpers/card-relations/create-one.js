/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    cardCannotBeRelatedToItself: {},
    relationAlreadyExists: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (values.card.id === values.relatedCard.id) {
      throw 'cardCannotBeRelatedToItself';
    }

    let cardRelation = await CardRelation.qm.getOneByCardIdAndRelatedCardIdAndKind(
      values.card.id,
      values.relatedCard.id,
      values.kind,
    );

    if (!cardRelation) {
      cardRelation = await CardRelation.qm.getOneByCardIdAndRelatedCardIdAndKind(
        values.relatedCard.id,
        values.card.id,
        values.kind,
      );
    }

    if (cardRelation) {
      throw 'relationAlreadyExists';
    }

    cardRelation = await CardRelation.qm.createOne({
      cardId: values.card.id,
      relatedCardId: values.relatedCard.id,
      kind: values.kind,
    });

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'cardRelationCreate',
      {
        item: cardRelation,
      },
      inputs.request,
    );

    return cardRelation;
  },
};
