/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/notification-services:
 *   post:
 *     summary: Create notification service for board
 *     description: Creates a new notification service for a board. Requires project manager permissions.
 *     tags:
 *       - Notification Services
 *     operationId: createBoardNotificationService
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board to create notification service for
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
 *               - url
 *               - format
 *             properties:
 *               url:
 *                 type: string
 *                 maxLength: 512
 *                 description: URL endpoint for notifications
 *                 example: https://service.example.com/planka
 *               format:
 *                 type: string
 *                 enum: [text, markdown, html]
 *                 description: Format for notification messages
 *                 example: text
 *     responses:
 *       200:
 *         description: Notification service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/NotificationService'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  LIMIT_REACHED: {
    limitReached: 'Limit reached',
  },
};

module.exports = {
  inputs: {
    boardId: {
      ...idInput,
      required: true,
    },
    url: {
      type: 'string',
      maxLength: 512,
      required: true,
    },
    format: {
      type: 'string',
      isIn: Object.values(NotificationService.Formats),
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
    limitReached: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['url', 'format']);

    const notificationService = await sails.helpers.notificationServices.createOneInBoard
      .with({
        project,
        values: {
          ...values,
          board,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('limitReached', () => Errors.LIMIT_REACHED);

    return {
      item: notificationService,
    };
  },
};
