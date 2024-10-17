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
    const cards = await sails.helpers.boards.getCards(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(cards);
  },
};
