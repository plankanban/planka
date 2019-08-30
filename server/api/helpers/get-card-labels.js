module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: value => _.isArray(value) || _.isPlainObject(value)
    }
  },

  fn: async function(inputs, exits) {
    const cardLabels = await CardLabel.find(inputs.criteria).sort('id');

    return exits.success(cardLabels);
  }
};
