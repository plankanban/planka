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
    await CardLabel.destroy({
      labelId: inputs.record.id
    });

    const label = await Label.archiveOne(inputs.record.id);

    if (label) {
      sails.sockets.broadcast(
        `board:${label.boardId}`,
        'labelDelete',
        {
          item: label
        },
        inputs.request
      );
    }

    return exits.success(label);
  }
};
