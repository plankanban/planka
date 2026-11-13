/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Deletes everything that hangs off a project.
 *
 * Children before parents -- see the ordering contract in
 * `helpers/cards/delete-related.js`.
 *
 * Boards now go before base custom field groups: board- and card-scoped
 * `custom_field_group` rows point at `base_custom_field_group`, so the base
 * groups have to outlive the boards that reference them.
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

    const boards = await Board.qm.getByProjectIds(projectIdOrIds);

    await sails.helpers.boards.deleteRelated(boards);

    await Board.qm.delete({
      projectId: projectIdOrIds,
    });

    const baseCustomFieldGroups = await BaseCustomFieldGroup.qm.getByProjectIds(projectIdOrIds);

    await sails.helpers.baseCustomFieldGroups.deleteRelated(baseCustomFieldGroups);

    await BaseCustomFieldGroup.qm.delete({
      projectId: projectIdOrIds,
    });

    const { uploadedFiles } = await BackgroundImage.qm.delete({
      projectId: projectIdOrIds,
    });

    sails.helpers.utils.removeUnreferencedUploadedFiles(uploadedFiles);

    const projectManagers = await ProjectManager.qm.delete({
      projectId: projectIdOrIds,
    });

    return { projectManagers };
  },
};
