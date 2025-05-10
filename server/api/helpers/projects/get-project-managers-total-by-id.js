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
    exceptProjectManagerIdOrIds: {
      type: 'json',
    },
  },

  async fn(inputs) {
    const projectManagers = await ProjectManager.qm.getByProjectId(inputs.id, {
      exceptIdOrIds: inputs.exceptProjectManagerIdOrIds,
    });

    return projectManagers.length;
  },
};
