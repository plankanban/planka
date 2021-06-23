module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
    exceptUserIdOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
    },
  },

  async fn(inputs) {
    const cardSubscriptions = await sails.helpers.cards.getCardSubscriptions(
      inputs.idOrIds,
      inputs.exceptUserIdOrIds,
    );

    return sails.helpers.utils.mapRecords(cardSubscriptions, 'userId', _.isArray(inputs.idOrIds));
  },
};
