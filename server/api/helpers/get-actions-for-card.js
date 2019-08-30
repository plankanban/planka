const LIMIT = 10;

module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isInteger(value) || _.isArray(value),
      required: true
    },
    beforeId: {
      type: 'number'
    }
  },

  fn: async function(inputs, exits) {
    const criteria = {
      cardId: inputs.id
    };

    if (!_.isUndefined(inputs.beforeId)) {
      criteria.id = {
        '<': inputs.beforeId
      };
    }

    const actions = await sails.helpers.getActions(criteria, LIMIT);

    return exits.success(actions);
  }
};
