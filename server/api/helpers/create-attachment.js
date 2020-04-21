module.exports = {
  inputs: {
    card: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs, exits) {
    const attachment = await Attachment.create({
      ...inputs.values,
      cardId: inputs.card.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${inputs.card.boardId}`,
      'attachmentCreate',
      {
        item: attachment,
      },
      inputs.request,
    );

    return exits.success(attachment);
  },
};
