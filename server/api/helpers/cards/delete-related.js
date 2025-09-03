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
    let cardIdOrIds;
    if (_.isPlainObject(inputs.recordOrRecords)) {
      ({
        recordOrRecords: { id: cardIdOrIds },
      } = inputs);
    } else if (_.every(inputs.recordOrRecords, _.isPlainObject)) {
      cardIdOrIds = sails.helpers.utils.mapRecords(inputs.recordOrRecords);
    }

    await CardSubscription.qm.delete({
      cardId: cardIdOrIds,
    });

    await CardMembership.qm.delete({
      cardId: cardIdOrIds,
    });

    await CardLabel.qm.delete({
      cardId: cardIdOrIds,
    });

    const taskLists = await TaskList.qm.delete({
      cardId: cardIdOrIds,
    });

    await sails.helpers.taskLists.deleteRelated(taskLists);

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

    const customFieldGroups = await CustomFieldGroup.qm.delete({
      cardId: cardIdOrIds,
    });

    await sails.helpers.customFieldGroups.deleteRelated(customFieldGroups);

    await Comment.qm.delete({
      cardId: cardIdOrIds,
    });

    await Action.qm.delete({
      cardId: cardIdOrIds,
    });
  },
};
