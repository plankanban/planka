module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
    withProjectMembership: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs, exits) {
    const project = await Project.create(inputs.values).fetch();

    const projectMembership = await ProjectMembership.create({
      projectId: project.id,
      userId: inputs.user.id,
    }).fetch();

    sails.sockets.broadcast(
      `user:${projectMembership.userId}`,
      'projectCreate',
      {
        item: project,
        included: {
          users: [inputs.user],
          projectMemberships: [projectMembership],
          boards: [],
        },
      },
      inputs.request,
    );

    return exits.success(
      inputs.withProjectMembership
        ? {
          project,
          projectMembership,
        }
        : project,
    );
  },
};
