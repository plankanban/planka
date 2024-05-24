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
        projectId: list.board.projectId,
        user: inputs.request.currentUser,
        board: list.board,
      });
    }

    return list;
  },
};
