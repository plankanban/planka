const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    exceptUserIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
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
