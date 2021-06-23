module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
  },

  async fn(inputs) {
    return sails.helpers.labels.getMany({
      boardId: inputs.idOrIds,
    });
  },
};
