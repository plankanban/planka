module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: (value) => _.isString(value) || _.isArray(value),
      required: true,
    },
    withProjectMemberships: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs, exits) {
    const projectMemberships = await sails.helpers.getMembershipsForProject(inputs.id);

    const userIds = sails.helpers.mapRecords(projectMemberships, 'userId', _.isArray(inputs.id));

    return exits.success(
      inputs.withProjectMemberships
        ? {
          userIds,
          projectMemberships,
        }
        : userIds,
    );
  },
};
