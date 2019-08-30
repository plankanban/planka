module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isInteger(value) || _.isArray(value),
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const projectMemberships = await sails.helpers.getProjectMembershipsForUser(
      inputs.id
    );

    const projectIds = sails.helpers.mapRecords(
      projectMemberships,
      'projectId',
      _.isArray(inputs.id)
    );

    return exits.success(projectIds);
  }
};
