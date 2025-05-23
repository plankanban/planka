/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  TASK_LIST_NOT_FOUND: {
    taskListNotFound: 'Task list not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    taskListNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { taskList, board, project } = await sails.helpers.taskLists
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.TASK_LIST_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          board.id,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.TASK_LIST_NOT_FOUND; // Forbidden
        }
      }
    }

    const tasks = await Task.qm.getByTaskListId(taskList.id);

    return {
      item: taskList,
      included: {
        tasks,
      },
    };
  },
};
