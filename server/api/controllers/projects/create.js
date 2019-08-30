module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['name']);

    const { project, projectMembership } = await sails.helpers.createProject(
      values,
      currentUser,
      this.req,
      true
    );

    return exits.success({
      item: project,
      included: {
        users: [currentUser],
        projectMemberships: [projectMembership],
        boards: []
      }
    });
  }
};
