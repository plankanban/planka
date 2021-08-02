module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    await BoardMembership.destroy({
      boardId: inputs.record.id,
    }).fetch();

    const board = await Board.archiveOne(inputs.record.id);

    if (board) {
      sails.sockets.leaveAll(`board:${board.id}`);

      sails.sockets.broadcast(
        `project:${board.projectId}`,
        'boardDelete',
        {
          item: board,
        },
        inputs.request,
      );
    }

    return board;
  },
};
