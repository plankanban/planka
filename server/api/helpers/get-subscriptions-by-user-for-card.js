module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isInteger(value) || _.isArray(value),
      required: true
    },
    userId: {
      type: 'json',
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const cardSubscriptions = await sails.helpers.getCardSubscriptions({
      cardId: inputs.id,
      userId: inputs.userId
    });

    return exits.success(cardSubscriptions);
  }
};
