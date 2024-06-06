module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    card: {
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
    const action = await Action.archiveOne(inputs.record.id);

    if (action) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'actionDelete',
        {
          item: action,
        },
        inputs.request,
      );

      await sails.helpers.utils.sendWebhook.with({
        event: 'ACTION_DELETE',
        data: action,
        projectId: inputs.board.projectId,
        user: inputs.request.currentUser,
        card: inputs.card,
        board: inputs.board,
      });
    }

    return action;
  },
};
