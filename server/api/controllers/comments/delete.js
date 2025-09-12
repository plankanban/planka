/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete comment
 *     description: Deletes a comment. Can be deleted by the comment author (with comment permissions) or project manager.
 *     tags:
 *       - Comments
 *     operationId: deleteComment
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the comment to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Comment'
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
  COMMENT_NOT_FOUND: {
    commentNotFound: 'Comment not found',
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
    commentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.comments
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.COMMENT_NOT_FOUND);

    let { comment } = pathToProject;
    const { card, list, board, project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      if (comment.userId !== currentUser.id) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }

      const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
        board.id,
        currentUser.id,
      );

      if (!boardMembership) {
        throw Errors.COMMENT_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
        if (!boardMembership.canComment) {
          throw Errors.NOT_ENOUGH_RIGHTS;
        }
      }
    }

    comment = await sails.helpers.comments.deleteOne.with({
      project,
      board,
      list,
      card,
      record: comment,
      actorUser: currentUser,
      request: this.req,
    });

    if (!comment) {
      throw Errors.COMMENT_NOT_FOUND;
    }

    return {
      item: comment,
    };
  },
};
