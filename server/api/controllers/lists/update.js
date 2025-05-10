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
    type: {
      type: 'string',
      isIn: List.FINITE_TYPES,
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
    color: {
      type: 'string',
      isIn: List.COLORS,
      allowNull: true,
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

    const values = _.pick(inputs, ['type', 'position', 'name', 'color']);

    list = await sails.helpers.lists.updateOne.with({
      values,
      project,
      board,
      record: list,
      actorUser: currentUser,
      request: this.req,
    });

    if (!list) {
      throw Errors.LIST_NOT_FOUND;
    }

    return {
      item: list,
    };
  },
};
