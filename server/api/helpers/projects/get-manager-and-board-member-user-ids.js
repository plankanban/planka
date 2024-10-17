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
    const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(inputs.idOrIds);
    const boardMemberUserIds = await sails.helpers.projects.getBoardMemberUserIds(inputs.idOrIds);

    return _.union(projectManagerUserIds, boardMemberUserIds);
  },
};
