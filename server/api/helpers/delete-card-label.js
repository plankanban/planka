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
    const cardLabel = await CardLabel.destroyOne(inputs.record.id);

    if (cardLabel) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'cardLabelDelete',
        {
          item: cardLabel
        },
        inputs.request
      );
    }

    return exits.success(cardLabel);
  }
};
