const criteriaValidator = (value) => _.isArray(value) || _.isPlainObject(value);

module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: criteriaValidator,
    },
    limit: {
      type: 'number',
    },
  },

  async fn(inputs) {
    return Action.find(inputs.criteria).sort('id DESC').limit(inputs.limit);
  },
};
