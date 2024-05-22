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

      await sails.helpers.utils.sendWebhook.with({
        event: 'attachment_update',
        data: attachment,
        projectId: inputs.board.projectId,
        user: inputs.request.currentUser,
        board: inputs.board,
      });
    }

    return attachment;
  },
};
