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

    return cardLabel;
  },
};
