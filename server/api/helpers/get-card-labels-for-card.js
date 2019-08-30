module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isInteger(value) || _.isArray(value),
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const cardLabels = await sails.helpers.getCardLabels({
      cardId: inputs.id
    });

    return exits.success(cardLabels);
  }
};
