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
    request: {
      type: 'ref'
    }
  },

  fn: async function(inputs, exits) {
    const label = await Label.updateOne(inputs.record.id).set(inputs.values);

    if (label) {
      sails.sockets.broadcast(
        `board:${label.boardId}`,
        'labelUpdate',
        {
          item: label
        },
        inputs.request
      );
    }

    return exits.success(label);
  }
};
