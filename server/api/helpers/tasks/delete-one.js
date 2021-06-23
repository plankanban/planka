module.exports = {
  inputs: {
    record: {
      type: 'ref',
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
    const task = await Task.archiveOne(inputs.record.id);

    if (task) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'taskDelete',
        {
          item: task,
        },
        inputs.request,
      );
    }

    return task;
  },
};
