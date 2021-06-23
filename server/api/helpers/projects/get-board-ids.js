module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
  },

  async fn(inputs) {
    const boards = await sails.helpers.projects.getBoards(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(boards);
  },
};
