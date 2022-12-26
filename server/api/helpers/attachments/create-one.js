const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.creatorUser)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
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
    const { values } = inputs;

    const attachment = await Attachment.create({
      ...values,
      cardId: values.card.id,
      creatorUserId: values.creatorUser.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${values.card.boardId}`,
      'attachmentCreate',
      {
        item: attachment,
        requestId: inputs.requestId,
      },
      inputs.request,
    );

    if (!values.card.coverAttachmentId && attachment.image) {
      await sails.helpers.cards.updateOne.with({
        record: values.card,
        values: {
          coverAttachmentId: attachment.id,
        },
      });
    }

    return attachment;
  },
};
