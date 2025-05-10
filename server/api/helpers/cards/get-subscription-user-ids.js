/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    exceptUserIdOrIds: {
      type: 'json',
    },
  },

  async fn(inputs) {
    const cardSubscriptions = await CardSubscription.qm.getByCardId(inputs.id, {
      exceptUserIdOrIds: inputs.exceptUserIdOrIds,
    });

    return sails.helpers.utils.mapRecords(cardSubscriptions, 'userId');
  },
};
