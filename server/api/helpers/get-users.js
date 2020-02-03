module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: value => _.isArray(value) || _.isPlainObject(value),
    },
  },

  async fn(inputs, exits) {
    const criteria = {
      deletedAt: null,
    };

    if (_.isArray(inputs.criteria)) {
      criteria.id = inputs.criteria;
    } else if (_.isPlainObject(inputs.criteria)) {
      Object.assign(criteria, inputs.criteria);
    }

    const users = await User.find(criteria).sort('id');

    return exits.success(users);
  },
};
