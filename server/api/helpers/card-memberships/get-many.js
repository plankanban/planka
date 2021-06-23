module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: (value) => _.isArray(value) || _.isPlainObject(value),
    },
  },

  async fn(inputs) {
    return CardMembership.find(inputs.criteria).sort('id');
  },
};
