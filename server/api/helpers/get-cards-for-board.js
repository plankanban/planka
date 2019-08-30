module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isInteger(value) || _.isArray(value),
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const cards = await sails.helpers.getCards({
      boardId: inputs.id
    });

    return exits.success(cards);
  }
};
