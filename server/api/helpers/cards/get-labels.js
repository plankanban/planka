module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
  },

  async fn(inputs) {
    const labelIds = await sails.helpers.cards.getLabelIds(inputs.idOrIds);

    return sails.helpers.labels.getMany(labelIds);
  },
};
