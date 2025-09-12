/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/actions:
 *   get:
 *     summary: Get board actions
 *     description: Retrieves a list of actions (activity history) for a specific board, with pagination support.
 *     tags:
 *       - Actions
 *     operationId: getBoardActions
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board to get actions for
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: beforeId
 *         in: query
 *         required: false
 *         description: ID to get actions before (for pagination)
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Board actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *                 - included
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Action'
 *                 included:
 *                   type: object
 *                   required:
 *                     - users
 *                   properties:
 *                     users:
 *                       type: array
 *                       description: Related users
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    boardId: {
      ...idInput,
      required: true,
    },
    beforeId: idInput,
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
        const isProjectManager = await sails.helpers.users.isProjectManager(
          currentUser.id,
          project.id,
        );

        if (!isProjectManager) {
          throw Errors.BOARD_NOT_FOUND; // Forbidden
        }
      }
    }

    const actions = await Action.qm.getByBoardId(board.id, {
      beforeId: inputs.beforeId,
    });

    const userIds = sails.helpers.utils.mapRecords(actions, 'userId', true, true);
    const users = await User.qm.getByIds(userIds);

    return {
      items: actions,
      included: {
        users: sails.helpers.users.presentMany(users, currentUser),
      },
    };
  },
};
