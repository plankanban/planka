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
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    targetProjectId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    boardNotFound: {
      responseType: 'notFound',
    },
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project: sourceProject } = await sails.helpers.boards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const targetProject = await Project.qm.getOneById(inputs.targetProjectId);
    if (!targetProject) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isSourceProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      sourceProject.id,
    );
    const isTargetProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      targetProject.id,
    );

    if (!isSourceProjectManager || !isTargetProjectManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const { updatedBoard, updatedCards } = await sails.helpers.boards.moveToProject.with({
      board,
      targetProject,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: updatedBoard,
      included: {
        cards: updatedCards,
      },
    };
  },
};
