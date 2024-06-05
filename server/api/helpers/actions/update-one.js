module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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
    const { values } = inputs;

    const action = await Action.updateOne(inputs.record.id).set({ ...values });

    if (action) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'actionUpdate',
        {
          item: action,
        },
        inputs.request,
      );

      await sails.helpers.utils.sendWebhook.with({
        event: 'ACTION_UPDATE',
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
