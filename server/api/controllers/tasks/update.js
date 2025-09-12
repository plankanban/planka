/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update task
 *     description: Updates a task. Linked card tasks have limited update options. Requires board editor permissions.
 *     tags:
 *       - Tasks
 *     operationId: updateTask
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the task to update
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
 *               taskListId:
 *                 type: string
 *                 description: ID of the task list to move the task to
 *                 example: "1357158568008091265"
 *               assigneeUserId:
 *                 type: string
 *                 nullable: true
 *                 description: ID of the user assigned to the task (null to unassign)
 *                 example: "1357158568008091266"
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position of the task within the task list
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 1024
 *                 description: Name/title of the task
 *                 example: Write unit tests
 *               isCompleted:
 *                 type: boolean
 *                 description: Whether the task is completed
 *                 example: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Task'
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
  TASK_NOT_FOUND: {
    taskNotFound: 'Task not found',
  },
  TASK_LIST_NOT_FOUND: {
    taskListNotFound: 'Task list not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    taskListId: idInput,
    assigneeUserId: {
      ...idInput,
      allowNull: true,
    },
    position: {
      type: 'number',
      min: 0,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
    },
    isCompleted: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    taskNotFound: {
      responseType: 'notFound',
    },
    taskListNotFound: {
      responseType: 'notFound',
    },
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.tasks
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.TASK_NOT_FOUND);

    let { task } = pathToProject;
    const { taskList, card, list, board, project } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.TASK_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (task.linkedCardId) {
      const availableInputKeys = ['id', 'taskListId', 'position'];

      if (_.difference(Object.keys(inputs), availableInputKeys).length > 0) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    let nextTaskList;
    if (!_.isUndefined(inputs.taskListId)) {
      nextTaskList = await TaskList.qm.getOneById(inputs.taskListId, {
        cardId: card.id,
      });

      if (!nextTaskList) {
        throw Errors.TASK_LIST_NOT_FOUND;
      }
    }

    if (inputs.assigneeUserId) {
      const isBoardMember = await sails.helpers.users.isBoardMember(
        inputs.assigneeUserId,
        board.id,
      );

      if (!isBoardMember) {
        throw Errors.USER_NOT_FOUND;
      }
    }

    const values = _.pick(inputs, ['assigneeUserId', 'position', 'name', 'isCompleted']);

    task = await sails.helpers.tasks.updateOne.with({
      project,
      board,
      list,
      card,
      taskList,
      record: task,
      values: {
        ...values,
        taskList: nextTaskList,
      },
      actorUser: currentUser,
      request: this.req,
    });

    if (!task) {
      throw Errors.TASK_NOT_FOUND;
    }

    return {
      item: task,
    };
  },
};
