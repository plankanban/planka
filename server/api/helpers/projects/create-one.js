module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
    actorUser: {
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
      userId: inputs.actorUser.id,
    }).fetch();

    sails.sockets.broadcast(
      `user:${projectManager.userId}`,
      'projectCreate',
      {
        item: project,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'projectCreate',
      data: {
        item: project,
      },
      user: inputs.actorUser,
    });

    return {
      project,
      projectManager,
    };
  },
};
