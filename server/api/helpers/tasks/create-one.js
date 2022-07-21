module.exports = {
  inputs: {
    values: {
      type: 'json',
      custom: (value) => _.isPlainObject(value) && _.isFinite(value.position),
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const tasks = await sails.helpers.cards.getTasks(inputs.card.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      inputs.values.position,
      tasks,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Task.update({
        id,
        cardId: inputs.card.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${inputs.card.boardId}`, 'taskUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const task = await Task.create({
      ...inputs.values,
      position,
      cardId: inputs.card.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${inputs.card.boardId}`,
      'taskCreate',
      {
        item: task,
      },
      inputs.request,
    );

    return task;
  },
};
