/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/board-memberships:
 *   post:
 *     summary: Create board membership
 *     description: Creates a board membership within a board. Requires project manager permissions.
 *     tags:
 *       - Board Memberships
 *     operationId: createBoardMembership
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board to create the board membership in
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
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user who is a member of the board
 *                 example: "1357158568008091265"
 *               role:
 *                 type: string
 *                 enum: [editor, viewer]
 *                 description: Role of the user in the board
 *                 example: editor
 *               canComment:
 *                 type: boolean
 *                 nullable: true
 *                 description: Whether the user can comment on cards (applies only to viewers)
 *                 example: true
 *     responses:
 *       200:
 *         description: Board membership created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BoardMembership'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  USER_ALREADY_BOARD_MEMBER: {
    userAlreadyBoardMember: 'User already board member',
  },
};

module.exports = {
  inputs: {
    boardId: {
      ...idInput,
      required: true,
    },
    userId: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(BoardMembership.Roles),
      required: true,
    },
    canComment: {
      type: 'boolean',
      allowNull: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    boardNotFound: {
      responseType: 'notFound',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    userAlreadyBoardMember: {
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

    if (!sails.helpers.users.isAdminOrProjectOwner(currentUser)) {
      if (inputs.userId !== currentUser.id) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const user = await User.qm.getOneById(inputs.userId, {
      withDeactivated: false,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    const values = _.pick(inputs, ['role', 'canComment']);

    const boardMembership = await sails.helpers.boardMemberships.createOne
      .with({
        project,
        values: {
          ...values,
          board,
          user,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('userAlreadyBoardMember', () => Errors.USER_ALREADY_BOARD_MEMBER);

    return {
      item: boardMembership,
    };
  },
};
