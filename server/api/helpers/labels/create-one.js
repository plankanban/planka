const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.board)) {
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

  async fn(inputs) {
    const { values } = inputs;

    const labels = await sails.helpers.boards.getLabels(values.board.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      labels,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Label.update({
        id,
        boardId: values.board.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${values.board.id}`, 'labelUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const label = await Label.create({
      ...values,
      position,
      boardId: values.board.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${label.boardId}`,
      'labelCreate',
      {
        item: label,
      },
      inputs.request,
    );

    return label;
  },
};
