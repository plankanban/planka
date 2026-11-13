/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Deletes everything that hangs off a card.
 *
 * ORDERING CONTRACT (see also boards/, lists/, projects/, users/, and
 * base-custom-field-groups/ delete-related): children are always deleted
 * BEFORE the parent row they point at. There are no transactions in this
 * layer, so any throw, pod restart or statement timeout leaves the cascade
 * half-done. Deleting the parent first makes that half-done state a permanent
 * orphan (a child row whose FK points at a row that no longer exists) --
 * exactly the class of row that white-screened the whole UI in #8. Deleting
 * the child first makes the same half-done state merely incomplete: the parent
 * survives, the UI still renders, and re-running the delete finishes the job.
 *
 * Concretely: `TaskList.qm.delete()` must run AFTER `taskLists.deleteRelated()`,
 * not before it, so it is preceded by a plain fetch of the rows to recurse into.
 */
module.exports = {
  inputs: {
    recordOrRecords: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    let cardIdOrIds;
    if (_.isPlainObject(inputs.recordOrRecords)) {
      ({
        recordOrRecords: { id: cardIdOrIds },
      } = inputs);
    } else if (_.every(inputs.recordOrRecords, _.isPlainObject)) {
      cardIdOrIds = sails.helpers.utils.mapRecords(inputs.recordOrRecords);
    }

    // Notifications reference this card's comments and actions (`commentId`,
    // `actionId`) as well as the card itself, so they go first. They were never
    // deleted by card here at all before, which is why the live census found
    // orphaned notification.card_id / comment_id / action_id rows.
    await Notification.qm.delete({
      cardId: cardIdOrIds,
    });

    await CardSubscription.qm.delete({
      cardId: cardIdOrIds,
    });

    await CardMembership.qm.delete({
      cardId: cardIdOrIds,
    });

    await CardLabel.qm.delete({
      cardId: cardIdOrIds,
    });

    const taskLists = await TaskList.qm.getByCardIds(cardIdOrIds);

    await sails.helpers.taskLists.deleteRelated(taskLists);

    await TaskList.qm.delete({
      cardId: cardIdOrIds,
    });

    await Task.qm.update(
      {
        linkedCardId: cardIdOrIds,
      },
      {
        linkedCardId: null,
      },
    );

    const { uploadedFiles } = await Attachment.qm.delete({
      cardId: cardIdOrIds,
    });

    sails.helpers.utils.removeUnreferencedUploadedFiles(uploadedFiles);

    // A card's custom field VALUES are not all reachable from its custom field
    // GROUPS: a value can belong to a board-scoped group, which survives the
    // card. `customFieldGroups.deleteRelated()` only deletes values by group,
    // so those values were left behind on every single card deletion. Delete by
    // card first, then the card-scoped groups mop up whatever is left.
    await CustomFieldValue.qm.delete({
      cardId: cardIdOrIds,
    });

    const customFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIdOrIds);

    await sails.helpers.customFieldGroups.deleteRelated(customFieldGroups);

    await CustomFieldGroup.qm.delete({
      cardId: cardIdOrIds,
    });

    await Comment.qm.delete({
      cardId: cardIdOrIds,
    });

    await Action.qm.delete({
      cardId: cardIdOrIds,
    });
  },
};
