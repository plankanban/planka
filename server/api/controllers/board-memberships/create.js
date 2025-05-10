/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
