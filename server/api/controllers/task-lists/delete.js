/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
    taskListNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.taskLists
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.TASK_LIST_NOT_FOUND);

    let { taskList } = pathToProject;
    const { card, list, board, project } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.TASK_LIST_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    taskList = await sails.helpers.taskLists.deleteOne.with({
      project,
      board,
      list,
      card,
      record: taskList,
      actorUser: currentUser,
      request: this.req,
    });

    if (!taskList) {
      throw Errors.TASK_LIST_NOT_FOUND;
    }

    return {
      item: taskList,
    };
  },
};
