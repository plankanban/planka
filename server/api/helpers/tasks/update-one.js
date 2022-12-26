const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: valuesValidator,
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

    if (!_.isUndefined(values.position)) {
      const tasks = await sails.helpers.cards.getTasks(inputs.record.cardId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        tasks,
      );

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await Task.update({
          id,
          cardId: inputs.record.cardId,
        }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`board:${inputs.board.id}`, 'taskUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    }

    const task = await Task.updateOne(inputs.record.id).set({ ...values });

    if (task) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'taskUpdate',
        {
          item: task,
        },
        inputs.request,
      );
    }

    return task;
  },
};
