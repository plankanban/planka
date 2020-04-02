module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: (value) => _.isString(value) || _.isArray(value),
      required: true,
    },
  },

  async fn(inputs, exits) {
    const cards = await sails.helpers.getCards({
      boardId: inputs.id,
    });

    return exits.success(cards);
  },
};
