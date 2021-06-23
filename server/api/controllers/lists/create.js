const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.boards
      .getProjectPath(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['position', 'name']);
    const list = await sails.helpers.lists.createOne(values, board, this.req);

    return {
      item: list,
    };
  },
};
