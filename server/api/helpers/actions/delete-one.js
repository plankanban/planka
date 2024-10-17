module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    actorUser: {
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

      sails.helpers.utils.sendWebhooks.with({
        event: 'actionDelete',
        data: {
          item: action,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        },
        user: inputs.actorUser,
      });
    }

    return action;
  },
};
