module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true
    },
    request: {
      type: 'ref'
    }
  },

  fn: async function(inputs, exits) {
    const list = await List.archiveOne(inputs.record.id);

    sails.sockets.broadcast(
      `board:${list.boardId}`,
      'listDelete',
      {
        item: list
      },
      inputs.request
    );

    return exits.success(list);
  }
};
