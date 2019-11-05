module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs, exits) {
    const list = await List.archiveOne(inputs.record.id);

    sails.sockets.broadcast(
      `board:${list.boardId}`,
      'listDelete',
      {
        item: list,
      },
      inputs.request,
    );

    return exits.success(list);
  },
};
