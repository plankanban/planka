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
    const list = await List.archiveOne(inputs.record.id);

    if (list) {
      sails.sockets.broadcast(
        `board:${list.boardId}`,
        'listDelete',
        {
          item: list,
        },
        inputs.request,
      );

      await sails.helpers.utils.sendWebhook.with({
        event: 'LIST_DELETE',
        data: list,
        projectId: inputs.board.projectId,
        user: inputs.request.currentUser,
        board: inputs.board,
      });
    }

    return list;
  },
};
