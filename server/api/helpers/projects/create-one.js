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
  },

  async fn(inputs) {
    const { values } = inputs;

    const project = await Project.create({ ...values }).fetch();

    const projectManager = await ProjectManager.create({
      projectId: project.id,
      userId: inputs.user.id,
    }).fetch();

    sails.sockets.broadcast(
      `user:${projectManager.userId}`,
      'projectCreate',
      {
        item: project,
      },
      inputs.request,
    );

    return {
      project,
      projectManager,
    };
  },
};
