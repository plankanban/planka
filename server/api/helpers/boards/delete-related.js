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
    let boardIdOrIds;
    if (_.isPlainObject(inputs.recordOrRecords)) {
      ({
        recordOrRecords: { id: boardIdOrIds },
      } = inputs);
    } else if (_.every(inputs.recordOrRecords, _.isPlainObject)) {
      boardIdOrIds = sails.helpers.utils.mapRecords(inputs.recordOrRecords);
    }

    const boardMemberships = await BoardMembership.qm.delete({
      boardId: boardIdOrIds,
    });

    await Label.qm.delete({
      boardId: boardIdOrIds,
    });

    const lists = await List.qm.delete({
      boardId: boardIdOrIds,
    });

    await sails.helpers.lists.deleteRelated(lists);

    await Action.qm.update(
      {
        boardId: boardIdOrIds,
      },
      {
        boardId: null,
      },
    );

    await NotificationService.qm.delete({
      boardId: boardIdOrIds,
    });

    return { boardMemberships };
  },
};
