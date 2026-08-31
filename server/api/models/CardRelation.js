/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const Kinds = {
  PARENTOF: 'parentOf',
  CHILDOF: 'childOf',
  BLOCKS: 'blocks',
  BLOCKEDBY: 'blockedBy',
  DUPLICATE: 'duplicate',
  RELATED: 'related',
};

module.exports = {
  Kinds,

  attributes: {
    kind: {
      type: 'string',
      isIn: Object.values(Kinds),
      required: true,
    },
    cardId: {
      model: 'Card',
      required: true,
      columnName: 'card_id',
    },
    relatedCardId: {
      model: 'Card',
      required: true,
      columnName: 'related_card_id',
    },
  },

  tableName: 'card_relation',
};
