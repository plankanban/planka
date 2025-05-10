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

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const projectManager = await ProjectManager.qm.getOneById(inputs.id);

    if (!projectManager) {
      throw 'pathNotFound';
    }

    const project = await Project.qm.getOneById(projectManager.projectId);

    if (!project) {
      throw {
        pathNotFound: {
          projectManager,
        },
      };
    }

    return {
      projectManager,
      project,
    };
  },
};
