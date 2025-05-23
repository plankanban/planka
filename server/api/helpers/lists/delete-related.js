/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    recordOrRecords: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    let listIdOrIds;
    if (_.isPlainObject(inputs.recordOrRecords)) {
      ({
        recordOrRecords: { id: listIdOrIds },
      } = inputs);
    } else if (_.every(inputs.recordOrRecords, _.isPlainObject)) {
      listIdOrIds = sails.helpers.utils.mapRecords(inputs.recordOrRecords);
    }

    const cards = await Card.qm.delete({
      listId: listIdOrIds,
    });

    await sails.helpers.cards.deleteRelated(cards);
  },
};
