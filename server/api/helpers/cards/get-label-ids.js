module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
  },

  async fn(inputs) {
    const cardLabels = await sails.helpers.cards.getCardLabels(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(cardLabels, 'labelId', _.isArray(inputs.idOrIds));
  },
};
