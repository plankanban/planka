module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: value => _.isInteger(value) || _.isPlainObject(value),
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const criteria = {
      deletedAt: null
    };

    if (_.isInteger(inputs.criteria)) {
      criteria.id = inputs.criteria;
    } else if (_.isPlainObject(inputs.criteria)) {
      Object.assign(criteria, inputs.criteria);
    }

    const user = await User.findOne(criteria);

    return exits.success(user);
  }
};
