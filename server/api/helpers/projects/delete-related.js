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
    let projectIdOrIds;
    if (_.isPlainObject(inputs.recordOrRecords)) {
      ({
        recordOrRecords: { id: projectIdOrIds },
      } = inputs);
    } else if (_.every(inputs.recordOrRecords, _.isPlainObject)) {
      projectIdOrIds = sails.helpers.utils.mapRecords(inputs.recordOrRecords);
    }

    await ProjectFavorite.qm.delete({
      projectId: projectIdOrIds,
    });

    const projectManagers = await ProjectManager.qm.delete({
      projectId: projectIdOrIds,
    });

    const { uploadedFiles } = await BackgroundImage.qm.delete({
      projectId: projectIdOrIds,
    });

    sails.helpers.utils.removeUnreferencedUploadedFiles(uploadedFiles);

    const baseCustomFieldGroups = await BaseCustomFieldGroup.qm.delete({
      projectId: projectIdOrIds,
    });

    await sails.helpers.baseCustomFieldGroups.deleteRelated(baseCustomFieldGroups);

    const boards = await Board.qm.delete({
      projectId: projectIdOrIds,
    });

    await sails.helpers.boards.deleteRelated(boards);

    return { projectManagers };
  },
};
