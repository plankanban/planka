const criteriaValidator = (value) => _.isArray(value) || _.isPlainObject(value);

module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: criteriaValidator,
    },
    withDeleted: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs) {
    const criteria = {};

    if (_.isArray(inputs.criteria)) {
      criteria.id = inputs.criteria;
    } else if (_.isPlainObject(inputs.criteria)) {
      Object.assign(criteria, inputs.criteria);
    }

    if (!inputs.withDeleted) {
      criteria.deletedAt = null;
    }

    return User.find(criteria).sort('id');
  },
};
