module.exports = {
  inputs: {
    card: {
      type: 'ref',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      defaultsTo: null,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs, exits) {
    const attachment = await Attachment.create({
      ...inputs.values,
      cardId: inputs.card.id,
      userId: inputs.user.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${inputs.card.boardId}`,
      'attachmentCreate',
      {
        item: attachment,
        requestId: inputs.requestId,
      },
      inputs.request,
    );

    if (!inputs.card.coverAttachmentId && attachment.isImage) {
      await sails.helpers.updateCard.with({
        record: inputs.card,
        values: {
          coverAttachmentId: attachment.id,
        },
        request: inputs.request,
      });
    }

    return exits.success(attachment);
  },
};
