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
        event: 'action_update',
        data: action,
        projectId: inputs.board.projectId,
        user: inputs.request.currentUser,
        board: inputs.board,
      });
    }

    return action;
  },
};
