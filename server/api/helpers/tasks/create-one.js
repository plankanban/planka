module.exports = {
  inputs: {
    values: {
      type: 'json',
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
    const task = await Task.create({
      ...inputs.values,
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
