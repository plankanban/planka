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
    const boardIds = await sails.helpers.projects.getBoardIds(inputs.idOrIds);

    return sails.helpers.boards.getMemberUserIds(boardIds);
  },
};
