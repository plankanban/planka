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

      await sails.helpers.utils.sendWebhook.with({
        event: 'task_delete',
        data: task,
        projectId: inputs.board.projectId,
        user: inputs.request.currentUser,
        board: inputs.board,
      });
    }

    return task;
  },
};
