/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
