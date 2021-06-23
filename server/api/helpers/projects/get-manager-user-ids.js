module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: (value) => _.isString(value) || _.every(value, _.isString),
      required: true,
    },
  },

  async fn(inputs) {
    const projectManagers = await sails.helpers.projects.getProjectManagers(inputs.idOrIds);

    return sails.helpers.utils.mapRecords(projectManagers, 'userId', _.isArray(inputs.idOrIds));
  },
};
