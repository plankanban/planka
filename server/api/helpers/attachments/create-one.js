module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const attachment = await Attachment.create({
      ...inputs.values,
      cardId: inputs.card.id,
      creatorUserId: inputs.user.id,
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
      await sails.helpers.cards.updateOne(inputs.card, {
        coverAttachmentId: attachment.id,
      });
    }

    return attachment;
  },
};
