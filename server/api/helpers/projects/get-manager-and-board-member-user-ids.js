module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
  },

  async fn(inputs) {
    const managerUserIds = await sails.helpers.projects.getManagerUserIds(inputs.idOrIds);
    const memberUserIds = await sails.helpers.projects.getBoardMemberUserIds(inputs.idOrIds);

    return _.union(managerUserIds, memberUserIds);
  },
};
