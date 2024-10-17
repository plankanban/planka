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
    const boards = await sails.helpers.projects.getBoards(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(boards);
  },
};
