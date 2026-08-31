/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
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

  async fn(inputs) {
    const cardRelation = await CardRelation.qm.deleteOne(inputs.record.id);

    if (cardRelation) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'cardRelationDelete',
        {
          item: cardRelation,
        },
        inputs.request,
      );
    }

    return cardRelation;
  },
};
