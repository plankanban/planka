module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
  },

  async fn(inputs) {
    const boardIds = await sails.helpers.projects.getBoardIds(inputs.idOrIds);

    return sails.helpers.boards.getMemberUserIds(boardIds);
  },
};
