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
  CANNOT_BE_SORTED_AS_ENDLESS_LIST: {
    cannotBeSortedAsEndlessList: 'Cannot be sorted as endless list',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    fieldName: {
      type: 'string',
      isIn: Object.values(List.SortFieldNames),
      required: true,
    },
    order: {
      type: 'string',
      isIn: Object.values(List.SortOrders),
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
    cannotBeSortedAsEndlessList: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, board, project } = await sails.helpers.lists
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const options = _.pick(inputs, ['fieldName', 'order']);

    const cards = await sails.helpers.lists.sortOne
      .with({
        options,
        project,
        board,
        record: list,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('cannotBeSortedAsEndlessList', () => Errors.CANNOT_BE_SORTED_AS_ENDLESS_LIST);

    return {
      item: list,
      included: {
        cards,
      },
    };
  },
};
