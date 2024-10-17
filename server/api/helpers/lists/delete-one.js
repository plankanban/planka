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
    actorUser: {
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

      sails.helpers.utils.sendWebhooks.with({
        event: 'listDelete',
        data: {
          item: list,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
          },
        },
        user: inputs.actorUser,
      });
    }

    return list;
  },
};
