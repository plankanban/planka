const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
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

    const tasks = await sails.helpers.cards.getTasks(values.card.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      tasks,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Task.update({
        id,
        cardId: values.card.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${values.card.boardId}`, 'taskUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const task = await Task.create({
      ...values,
      position,
      cardId: values.card.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${values.card.boardId}`,
      'taskCreate',
      {
        item: task,
      },
      inputs.request,
    );

    return task;
  },
};
