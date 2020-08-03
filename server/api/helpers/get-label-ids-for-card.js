module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: (value) => _.isString(value) || _.isArray(value),
      required: true,
    },
  },

  async fn(inputs, exits) {
    const cardLabels = await sails.helpers.getCardLabelsForCard(inputs.id);
    const labelIds = sails.helpers.mapRecords(cardLabels, 'labelId', _.isArray(inputs.id));

    return exits.success(labelIds);
  },
};
