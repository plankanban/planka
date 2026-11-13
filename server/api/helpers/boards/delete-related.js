/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Deletes everything that hangs off a board.
 *
 * Children before parents -- see the ordering contract in
 * `helpers/cards/delete-related.js`.
 *
 * Two whole subtrees used to be missed here entirely: board-scoped
 * `CustomFieldGroup` rows (1118 orphans in the live census -- the single
 * biggest source) and `BoardSubscription`, which was never cleaned up on
 * board deletion or on user deletion.
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

    // Notifications point at the board as well as at its cards, comments and
    // actions. Deleting them by board first also covers any notification whose
    // card row is about to disappear below.
    await Notification.qm.delete({
      boardId: boardIdOrIds,
    });

    await BoardSubscription.qm.delete({
      boardId: boardIdOrIds,
    });

    await NotificationService.qm.delete({
      boardId: boardIdOrIds,
    });

    // `webhook.board_id` was left dangling too, but the row is NOT deleted:
    // `helpers/utils/send-webhooks.js` never reads `boardId`, so every webhook
    // already fires for every board and dropping the row would silently switch
    // off a working operator integration. Nulled, exactly like `action.board_id`
    // below -- same situation, same treatment.
    await Webhook.qm.update(
      {
        boardId: boardIdOrIds,
      },
      {
        boardId: null,
      },
    );

    const lists = await List.qm.getByBoardIds(boardIdOrIds);

    await sails.helpers.lists.deleteRelated(lists);

    await List.qm.delete({
      boardId: boardIdOrIds,
    });

    // Board-scoped custom field groups. Card-scoped ones are already gone with
    // their cards above.
    const customFieldGroups = await CustomFieldGroup.qm.getByBoardIds(boardIdOrIds);

    await sails.helpers.customFieldGroups.deleteRelated(customFieldGroups);

    await CustomFieldGroup.qm.delete({
      boardId: boardIdOrIds,
    });

    // After the cards, because `card_label` rows point at these labels and are
    // only cleared by the card cascade above.
    await Label.qm.delete({
      boardId: boardIdOrIds,
    });

    await Action.qm.update(
      {
        boardId: boardIdOrIds,
      },
      {
        boardId: null,
      },
    );

    const boardMemberships = await BoardMembership.qm.delete({
      boardId: boardIdOrIds,
    });

    return { boardMemberships };
  },
};
