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
    const boardMemberships = await sails.helpers.users.getBoardMemberships(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(boardMemberships, 'boardId', _.isArray(inputs.idOrIds));
  },
};
