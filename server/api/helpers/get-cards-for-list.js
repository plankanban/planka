module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isString(value) || _.isArray(value),
      required: true
    },
    exceptCardId: {
      type: 'json',
      custom: value => _.isString(value) || _.isArray(value)
    }
  },

  fn: async function(inputs, exits) {
    const criteria = {
      listId: inputs.id
    };

    if (!_.isUndefined(inputs.exceptCardId)) {
      criteria.id = {
        '!=': inputs.exceptCardId
      };
    }

    const cards = await sails.helpers.getCards(criteria);

    return exits.success(cards);
  }
};
