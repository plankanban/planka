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
    taskListId: {
      ...idInput,
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 1024,
      required: true,
    },
    isCompleted: {
      type: 'boolean',
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

    const { taskList, card, list, board, project } = await sails.helpers.taskLists
      .getPathToProjectById(inputs.taskListId)
      .intercept('pathNotFound', () => Errors.TASK_LIST_NOT_FOUND);

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

    const values = _.pick(inputs, ['position', 'name', 'isCompleted']);

    const task = await sails.helpers.tasks.createOne.with({
      project,
      board,
      list,
      card,
      values: {
        ...values,
        taskList,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: task,
    };
  },
};
