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

    sails.helpers.utils.sendWebhooks.with({
      event: 'attachmentCreate',
      data: {
        item: attachment,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      },
      user: values.creatorUser,
    });

    if (!values.card.coverAttachmentId && attachment.image) {
      await sails.helpers.cards.updateOne.with({
        record: values.card,
        values: {
          coverAttachmentId: attachment.id,
        },
        project: inputs.project,
        board: inputs.board,
        list: inputs.list,
        actorUser: values.creatorUser,
      });
    }

    return attachment;
  },
};
