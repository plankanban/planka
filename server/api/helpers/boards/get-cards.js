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
    return sails.helpers.cards.getMany({
      boardId: inputs.idOrIds,
      status: inputs.status || 'active',
    });
  },
};
