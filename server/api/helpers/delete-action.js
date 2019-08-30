module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true
    },
    board: {
      type: 'ref',
      required: true
    },
    request: {
      type: 'ref'
    }
  },

  fn: async function(inputs, exits) {
    const action = await Action.archiveOne(inputs.record.id);

    if (action) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'actionDelete',
        {
          item: action
        },
        inputs.request
      );
    }

    return exits.success(action);
  }
};
