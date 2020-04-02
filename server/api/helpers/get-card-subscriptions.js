module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: (value) => _.isArray(value) || _.isPlainObject(value),
    },
  },

  async fn(inputs, exits) {
    const cardSubscriptions = await CardSubscription.find(inputs.criteria).sort('id');

    return exits.success(cardSubscriptions);
  },
};
