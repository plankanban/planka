/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    defaultView: {
      type: 'string',
      isIn: Object.values(Board.Views),
    },
    defaultCardType: {
      type: 'string',
      isIn: Object.values(Card.Types),
      allowNull: true,
    },
    limitCardTypesToDefaultOne: {
      type: 'boolean',
      allowNull: true,
    },
    alwaysDisplayCardCreator: {
      type: 'boolean',
    },
    isSubscribed: {
      type: 'boolean',
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.boards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    let { board } = pathToProject;
    const { project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);
    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isProjectManager && !isBoardMember) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const availableInputKeys = ['id'];
    if (isProjectManager) {
      availableInputKeys.push(
        'position',
        'name',
        'defaultView',
        'defaultCardType',
        'limitCardTypesToDefaultOne',
        'alwaysDisplayCardCreator',
      );
    }
    if (isBoardMember) {
      availableInputKeys.push('isSubscribed');
    }

    if (_.difference(Object.keys(inputs), availableInputKeys).length > 0) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, [
      'position',
      'name',
      'defaultView',
      'defaultCardType',
      'limitCardTypesToDefaultOne',
      'alwaysDisplayCardCreator',
      'isSubscribed',
    ]);

    board = await sails.helpers.boards.updateOne.with({
      values,
      project,
      record: board,
      actorUser: currentUser,
      request: this.req,
    });

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    return {
      item: board,
    };
  },
};
