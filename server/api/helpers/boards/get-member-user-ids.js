module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
  },

  async fn(inputs) {
    const boardMemberships = await sails.helpers.boards.getBoardMemberships(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(boardMemberships, 'userId', _.isArray(inputs.idOrIds));
  },
};
