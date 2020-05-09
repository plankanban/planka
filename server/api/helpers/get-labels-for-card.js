module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: (value) => _.isString(value) || _.isArray(value),
      required: true,
    },
  },

  async fn(inputs, exits) {
    const labelIds = await sails.helpers.getLabelIdsForCard(inputs.id);

    const labels = await sails.helpers.getLabels(labelIds);

    return exits.success(labels);
  },
};
