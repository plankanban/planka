module.exports = {
  inputs: {
    board: {
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
    const label = await Label.create({
      ...inputs.values,
      boardId: inputs.board.id
    }).fetch();

    sails.sockets.broadcast(
      `board:${label.boardId}`,
      'labelCreate',
      {
        item: label
      },
      inputs.request
    );

    return exits.success(label);
  }
};
