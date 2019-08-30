module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isInteger(value) || _.isArray(value),
      required: true
    },
    exceptUserId: {
      type: 'number',
      custom: value => _.isInteger(value) || _.isArray(value)
    }
  },

  fn: async function(inputs, exits) {
    const criteria = {
      cardId: inputs.id
    };

    if (!_.isUndefined(inputs.exceptUserId)) {
      criteria.userId = {
        '!=': inputs.exceptUserId
      };
    }

    const cardMemberships = await sails.helpers.getCardMemberships(criteria);

    return exits.success(cardMemberships);
  }
};
