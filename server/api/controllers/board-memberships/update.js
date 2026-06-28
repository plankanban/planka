/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-memberships/{id}:
 *   patch:
 *     summary: Update board membership
 *     description: Updates a board membership. Requires project manager permissions, except that the membership owner may update their own view preference.
 *     tags:
 *       - Board Memberships
 *     operationId: updateBoardMembership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board membership to update
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
 *               view:
 *                 type: string
 *                 enum: [kanban, grid, list]
 *                 nullable: true
 *                 description: User's preferred view for the board (can be set by the membership owner on their own membership)
 *                 example: kanban
 *     responses:
 *       200:
 *         description: Board membership updated successfully
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_MEMBERSHIP_NOT_FOUND: {
    boardMembershipNotFound: 'Board membership not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(BoardMembership.Roles),
    },
    canComment: {
      type: 'boolean',
      allowNull: true,
    },
    view: {
      type: 'string',
      isIn: Object.values(Board.Views),
      allowNull: true,
    },
  },

  exits: {
    boardMembershipNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.boardMemberships
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_MEMBERSHIP_NOT_FOUND);

    let { boardMembership } = pathToProject;
    const { board, project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);
    const isOwnMembership = boardMembership.userId === currentUser.id;

    if (!isProjectManager && !isOwnMembership) {
      throw Errors.BOARD_MEMBERSHIP_NOT_FOUND; // Forbidden
    }

    // Project managers can update the membership fully; a regular member may only
    // update the view preference of their own membership.
    const values = isProjectManager
      ? _.pick(inputs, ['role', 'canComment', 'view'])
      : _.pick(inputs, ['view']);

    boardMembership = await sails.helpers.boardMemberships.updateOne.with({
      values,
      project,
      board,
      record: boardMembership,
      actorUser: currentUser,
      request: this.req,
    });

    if (!boardMembership) {
      throw Errors.BOARD_MEMBERSHIP_NOT_FOUND;
    }

    return {
      item: boardMembership,
    };
  },
};
