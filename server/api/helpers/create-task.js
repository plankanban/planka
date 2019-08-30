module.exports = {
  inputs: {
    card: {
      type: 'ref',
      required: true
    },
    values: {
      type: 'json',
      required: true
    },
    request: {
      type: 'ref'
    }
  },

  fn: async function(inputs, exits) {
    const task = await Task.create({
      ...inputs.values,
      cardId: inputs.card.id
    }).fetch();

    sails.sockets.broadcast(
      `board:${inputs.card.boardId}`,
      'taskCreate',
      {
        item: task
      },
      inputs.request
    );

    return exits.success(task);
  }
};
