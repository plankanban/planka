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
    const taskList = await TaskList.qm.getOneById(inputs.id);

    if (!taskList) {
      throw 'pathNotFound';
    }

    const pathToProject = await sails.helpers.cards
      .getPathToProjectById(taskList.cardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          taskList,
          ...nodes,
        },
      }));

    return {
      taskList,
      ...pathToProject,
    };
  },
};
