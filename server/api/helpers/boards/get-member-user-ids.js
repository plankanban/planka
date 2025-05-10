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
  },

  async fn(inputs) {
    const boardMemberships = await BoardMembership.qm.getByBoardId(inputs.id);

    return sails.helpers.utils.mapRecords(boardMemberships, 'userId');
  },
};
