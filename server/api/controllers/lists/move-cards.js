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
    listId: {
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

    // TODO: allow for other types?
    if (list.type !== List.Types.CLOSED) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const nextList = await List.qm.getOneById(inputs.listId, {
      boardId: board.id,
    });

    if (!nextList) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    // TODO: allow for other types?
    if (nextList.type !== List.Types.ARCHIVE) {
      throw Errors.LIST_NOT_FOUND;
    }

    const { cards, actions } = await sails.helpers.lists.moveCards.with({
      project,
      board,
      record: list,
      values: {
        list: nextList,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: list,
      included: {
        cards,
        actions,
      },
    };
  },
};
