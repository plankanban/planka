module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['name']);

    const { project, projectManager } = await sails.helpers.projects.createOne(
      values,
      currentUser,
      this.req,
    );

    return {
      item: project,
      included: {
        projectManagers: [projectManager],
      },
    };
  },
};
