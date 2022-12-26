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
    const boardMemberships = await sails.helpers.boards.getBoardMemberships(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(boardMemberships, 'userId', _.isArray(inputs.idOrIds));
  },
};
