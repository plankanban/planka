module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true
    },
    values: {
      type: 'json',
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
    const action = await Action.updateOne(inputs.record.id).set(inputs.values);

    if (action) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'actionUpdate',
        {
          item: action
        },
        inputs.request
      );
    }

    return exits.success(action);
  }
};
