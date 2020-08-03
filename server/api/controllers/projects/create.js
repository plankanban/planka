module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['name']);

    const { project, projectMembership } = await sails.helpers.createProject(
      currentUser,
      values,
      this.req,
      true,
    );

    return exits.success({
      item: project,
      included: {
        users: [currentUser],
        projectMemberships: [projectMembership],
        boards: [],
      },
    });
  },
};
