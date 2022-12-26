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
    const projectManagers = await sails.helpers.users.getProjectManagers(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(projectManagers, 'projectId', _.isArray(inputs.idOrIds));
  },
};
