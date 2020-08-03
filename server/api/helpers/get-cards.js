module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: (value) => _.isArray(value) || _.isPlainObject(value),
    },
    sort: {
      type: 'json',
      defaultsTo: 'id DESC',
    },
    limit: {
      type: 'number',
    },
  },

  async fn(inputs, exits) {
    const cards = await Card.find(inputs.criteria).sort(inputs.sort).limit(inputs.limit);

    return exits.success(cards);
  },
};
