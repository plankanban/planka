module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isString(value) || _.isArray(value),
      required: true
    },
    exceptUserId: {
      type: 'json',
      custom: value => _.isString(value) || _.isArray(value)
    },
    withCardSubscriptions: {
      type: 'boolean',
      defaultsTo: false
    }
  },

  fn: async function(inputs, exits) {
    const cardSubscriptions = await sails.helpers.getSubscriptionsForCard(
      inputs.id,
      inputs.exceptUserId
    );

    const userIds = sails.helpers.mapRecords(
      cardSubscriptions,
      'userId',
      _.isArray(inputs.id)
    );

    return exits.success(
      inputs.withCardSubscriptions
        ? {
          userIds,
          cardSubscriptions
        }
        : userIds
    );
  }
};
