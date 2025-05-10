/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
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
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.lists
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    let { list } = pathToProject;
    const { board, project } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    if (!sails.helpers.lists.isFinite(list)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const result = await sails.helpers.lists.deleteOne.with({
      project,
      board,
      record: list,
      actorUser: currentUser,
      request: this.req,
    });

    ({ list } = result);
    const { cards } = result;

    if (!list) {
      throw Errors.LIST_NOT_FOUND;
    }

    return {
      item: list,
      included: {
        cards,
      },
    };
  },
};
