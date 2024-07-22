const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.label)) {
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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    labelAlreadyInCard: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    const cardLabel = await CardLabel.create({
      ...values,
      cardId: values.card.id,
      labelId: values.label.id,
    })
      .intercept('E_UNIQUE', 'labelAlreadyInCard')
      .fetch();

    sails.sockets.broadcast(
      `board:${values.card.boardId}`,
      'cardLabelCreate',
      {
        item: cardLabel,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'cardLabelCreate',
      data: {
        item: cardLabel,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          labels: [values.label],
          lists: [inputs.list],
          cards: [values.card],
        },
      },
      user: inputs.actorUser,
    });

    return cardLabel;
  },
};
