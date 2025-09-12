/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /task-lists/{taskListId}/tasks:
 *   post:
 *     summary: Create task
 *     description: Creates a task within a task list. Either `linkedCardId` or `name` must be provided. Requires board editor permissions.
 *     tags:
 *       - Tasks
 *     operationId: createTask
 *     parameters:
 *       - name: taskListId
 *         in: path
 *         required: true
 *         description: ID of the task list to create task in
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - position
 *             properties:
 *               linkedCardId:
 *                 type: string
 *                 description: ID of the card linked to the task
 *                 example: "1357158568008091265"
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position of the task within the task list
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 1024
 *                 nullable: true
 *                 description: Name/title of the task (required if `linkedCardId` is not provided)
 *                 example: Write unit tests
 *               isCompleted:
 *                 type: boolean
 *                 description: Whether the task is completed
 *                 example: false
 *     responses:
 *       200:
 *         description: Task created successfully
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
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  TASK_LIST_NOT_FOUND: {
    taskListNotFound: 'Task list not found',
  },
  LINKED_CARD_NOT_FOUND: {
    linkedCardNotFound: 'Linked card not found',
  },
  LINKED_CARD_OR_NAME_MUST_BE_PRESENT: {
    linkedCardOrNameMustBePresent: 'Linked card or name must be present',
  },
};

module.exports = {
  inputs: {
    taskListId: {
      ...idInput,
      required: true,
    },
    linkedCardId: idInput,
    position: {
      type: 'number',
      min: 0,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
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
    linkedCardNotFound: {
      responseType: 'notFound',
    },
    linkedCardOrNameMustBePresent: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { taskList, card, list, board, project } = await sails.helpers.taskLists
      .getPathToProjectById(inputs.taskListId)
      .intercept('pathNotFound', () => Errors.TASK_LIST_NOT_FOUND);

    let boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.TASK_LIST_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let linkedCard;
    if (!_.isUndefined(inputs.linkedCardId)) {
      const path = await sails.helpers.cards
        .getPathToProjectById(inputs.linkedCardId)
        .intercept('pathNotFound', () => Errors.LINKED_CARD_NOT_FOUND);

      ({ card: linkedCard } = path);

      if (currentUser.role !== User.Roles.ADMIN || path.project.ownerProjectManagerId) {
        const isProjectManager = await sails.helpers.users.isProjectManager(
          currentUser.id,
          path.project.id,
        );

        if (!isProjectManager) {
          boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
            linkedCard.boardId,
            currentUser.id,
          );

          if (!boardMembership) {
            throw Errors.LINKED_CARD_NOT_FOUND; // Forbidden
          }
        }
      }
    }

    const values = _.pick(inputs, ['position', 'name', 'isCompleted']);

    const task = await sails.helpers.tasks.createOne
      .with({
        project,
        board,
        list,
        card,
        values: {
          ...values,
          taskList,
          linkedCard,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept(
        'linkedCardOrNameMustBeInValues',
        () => Errors.LINKED_CARD_OR_NAME_MUST_BE_PRESENT,
      );

    return {
      item: task,
    };
  },
};
