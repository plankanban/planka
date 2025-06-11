const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true, // listId
    },
    targetBoardId: {
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
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, board: sourceBoard } = await sails.helpers.lists
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const targetBoard = await Board.qm.getOneById(inputs.targetBoardId);
    if (!targetBoard) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const sourceMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      sourceBoard.id,
      currentUser.id,
    );
    const targetMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      targetBoard.id,
      currentUser.id,
    );
    if (
      !sourceMembership ||
      !targetMembership ||
      sourceMembership.role !== BoardMembership.Roles.EDITOR ||
      targetMembership.role !== BoardMembership.Roles.EDITOR
    ) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const { updatedList, updatedCards } = await sails.helpers.lists.moveToBoard.with({
      list,
      targetBoard,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: updatedList,
      included: {
        cards: updatedCards,
      },
    };
  },
};
