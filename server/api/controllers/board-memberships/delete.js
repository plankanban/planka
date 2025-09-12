/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /board-memberships/{id}:
 *   delete:
 *     summary: Delete board membership
 *     description: Deletes a board membership. Users can remove their own membership, project managers can remove any membership.
 *     tags:
 *       - Board Memberships
 *     operationId: deleteBoardMembership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board membership to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Board membership deleted successfully
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

    if (boardMembership.userId !== currentUser.id) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.BOARD_MEMBERSHIP_NOT_FOUND; // Forbidden
      }
    }

    const user = await User.qm.getOneById(boardMembership.userId);

    boardMembership = await sails.helpers.boardMemberships.deleteOne.with({
      user,
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
