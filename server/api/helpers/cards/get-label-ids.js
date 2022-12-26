const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
  },

  async fn(inputs) {
    const cardLabels = await sails.helpers.cards.getCardLabels(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(cardLabels, 'labelId', _.isArray(inputs.idOrIds));
  },
};
