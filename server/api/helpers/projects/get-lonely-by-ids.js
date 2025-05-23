/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    ids: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const projectManagers = await ProjectManager.qm.getByProjectIds(inputs.ids);

    const managerProjectIdsSet = new Set(
      sails.helpers.utils.mapRecords(projectManagers, 'projectId', true),
    );

    const lonelyProjectIds = inputs.ids.filter((id) => !managerProjectIdsSet.has(id));

    return Project.qm.getByIds(lonelyProjectIds);
  },
};
