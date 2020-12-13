module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: (value) => _.isArray(value) || _.isPlainObject(value),
    },
    withDeleted: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs, exits) {
    const criteria = {};

    if (_.isArray(inputs.criteria)) {
      criteria.id = inputs.criteria;
    } else if (_.isPlainObject(inputs.criteria)) {
      Object.assign(criteria, inputs.criteria);
    }

    if (!inputs.withDeleted) {
      criteria.deletedAt = null;
    }

    const users = await User.find(criteria).sort('id');

    return exits.success(users);
  },
};
