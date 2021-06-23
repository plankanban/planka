module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const label = await Label.create({
      ...inputs.values,
      boardId: inputs.board.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${label.boardId}`,
      'labelCreate',
      {
        item: label,
      },
      inputs.request,
    );

    return label;
  },
};
