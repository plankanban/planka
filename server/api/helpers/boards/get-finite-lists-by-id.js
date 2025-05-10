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
    exceptListIdOrIds: {
      type: 'json',
    },
  },

  async fn(inputs) {
    return List.qm.getByBoardId(inputs.id, {
      exceptIdOrIds: inputs.exceptListIdOrIds,
      typeOrTypes: List.FINITE_TYPES,
    });
  },
};
