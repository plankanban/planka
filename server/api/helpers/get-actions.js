module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: (value) => _.isArray(value) || _.isPlainObject(value),
    },
    limit: {
      type: 'number',
    },
  },

  async fn(inputs, exits) {
    const actions = await Action.find(inputs.criteria).sort('id DESC').limit(inputs.limit);

    return exits.success(actions);
  },
};
