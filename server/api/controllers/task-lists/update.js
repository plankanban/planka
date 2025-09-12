/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /task-lists/{id}:
 *   patch:
 *     summary: Update task list
 *     description: Updates a task list. Requires board editor permissions.
 *     tags:
 *       - Task Lists
 *     operationId: updateTaskList
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the task list to update
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position of the task list within the card
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the task list
 *                 example: Development Tasks
 *               showOnFrontOfCard:
 *                 type: boolean
 *                 description: Whether to show the task list on the front of the card
 *                 example: true
 *               hideCompletedTasks:
 *                 type: boolean
 *                 description: Whether to hide completed tasks
 *                 example: false
 *     responses:
 *       200:
 *         description: Task list updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/TaskList'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
    position: {
      type: 'number',
      min: 0,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    showOnFrontOfCard: {
      type: 'boolean',
    },
    hideCompletedTasks: {
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

    const values = _.pick(inputs, ['position', 'name', 'showOnFrontOfCard', 'hideCompletedTasks']);

    taskList = await sails.helpers.taskLists.updateOne.with({
      values,
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
