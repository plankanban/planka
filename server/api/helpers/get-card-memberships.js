module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: value => _.isArray(value) || _.isPlainObject(value)
    }
  },

  fn: async function(inputs, exits) {
    const cardMemberships = await CardMembership.find(inputs.criteria).sort(
      'id'
    );

    return exits.success(cardMemberships);
  }
};
