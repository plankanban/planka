/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/task-lists:
 *   post:
 *     summary: Create task list
 *     description: Creates a task list within a card. Requires board editor permissions.
 *     tags:
 *       - Task Lists
 *     operationId: createTaskList
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         description: ID of the card to create task list in
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
 *               - name
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
 *         description: Task list created successfully
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
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
};

module.exports = {
  inputs: {
    cardId: {
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
      maxLength: 128,
      required: true,
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
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, list, board, project } = await sails.helpers.cards
      .getPathToProjectById(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['position', 'name', 'showOnFrontOfCard', 'hideCompletedTasks']);

    const taskList = await sails.helpers.taskLists.createOne.with({
      project,
      board,
      list,
      values: {
        ...values,
        card,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: taskList,
    };
  },
};
