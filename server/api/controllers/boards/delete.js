const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    let board = await Board.findOne(inputs.id);

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    board = await sails.helpers.deleteBoard(board, this.req);

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    return exits.success({
      item: board,
    });
  },
};
