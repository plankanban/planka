module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: (value) => _.isString(value) || _.isArray(value),
      required: true,
    },
    exceptUserId: {
      type: 'json',
      custom: (value) => _.isString(value) || _.isArray(value),
    },
  },

  async fn(inputs, exits) {
    const criteria = {
      cardId: inputs.id,
    };

    if (!_.isUndefined(inputs.exceptUserId)) {
      criteria.userId = {
        '!=': inputs.exceptUserId,
      };
    }

    const cardMemberships = await sails.helpers.getCardMemberships(criteria);

    return exits.success(cardMemberships);
  },
};
