/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /task-lists/{id}:
 *   get:
 *     summary: Get task list details
 *     description: Retrieves task list information, including tasks. Requires access to the card.
 *     tags:
 *       - Task Lists
 *     operationId: getTaskList
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the task list to retrieve
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Task list details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/TaskList'
 *                 included:
 *                   type: object
 *                   required:
 *                     - tasks
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       description: Related tasks
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
