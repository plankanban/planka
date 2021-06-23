module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
  },

  async fn(inputs) {
    const cards = await sails.helpers.boards.getCards(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(cards);
  },
};
