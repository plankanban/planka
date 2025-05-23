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
    const task = await Task.qm.getOneById(inputs.id);

    if (!task) {
      throw 'pathNotFound';
    }

    const pathToProject = await sails.helpers.taskLists
      .getPathToProjectById(task.taskListId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          task,
          ...nodes,
        },
      }));

    return {
      task,
      ...pathToProject,
    };
  },
};
