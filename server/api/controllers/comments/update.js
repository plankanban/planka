/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
    text: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1048576,
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

    if (comment.userId !== currentUser.id) {
      throw Errors.COMMENT_NOT_FOUND; // Forbidden
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

    const values = _.pick(inputs, ['text']);

    comment = await sails.helpers.comments.updateOne.with({
      values,
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
