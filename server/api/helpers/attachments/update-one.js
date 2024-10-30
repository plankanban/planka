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
    const { values } = inputs;

    const attachment = await Attachment.updateOne(inputs.record.id).set({ ...values });

    if (attachment) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'attachmentUpdate',
        {
          item: attachment,
        },
        inputs.request,
      );

      sails.helpers.utils.sendWebhooks.with({
        event: 'attachmentUpdate',
        data: {
          item: attachment,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        },
        prevData: {
          item: inputs.record,
        },
        user: inputs.actorUser,
      });
    }

    return attachment;
  },
};
