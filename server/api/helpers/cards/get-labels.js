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
    const labelIds = await sails.helpers.cards.getLabelIds(inputs.idOrIds);

    return sails.helpers.labels.getMany(labelIds);
  },
};
