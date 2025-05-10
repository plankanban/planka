/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
