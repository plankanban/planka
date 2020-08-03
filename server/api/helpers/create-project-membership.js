module.exports = {
  inputs: {
    project: {
      type: 'ref',
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

  exits: {
    userAlreadyProjectMember: {},
  },

  async fn(inputs, exits) {
    const projectMembership = await ProjectMembership.create({
      projectId: inputs.project.id,
      userId: inputs.user.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyProjectMember')
      .fetch();

    const { userIds, projectMemberships } = await sails.helpers.getMembershipUserIdsForProject(
      projectMembership.projectId,
      true,
    );

    userIds.forEach((userId) => {
      if (userId !== projectMembership.userId) {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectMembershipCreate',
          {
            item: projectMembership,
            included: {
              users: [inputs.user],
            },
          },
          inputs.request,
        );
      }
    });

    const users = await sails.helpers.getUsers(userIds);
    const boards = await sails.helpers.getBoardsForProject(projectMembership.projectId);

    sails.sockets.broadcast(`user:${projectMembership.userId}`, 'projectCreate', {
      item: inputs.project,
      included: {
        users,
        projectMemberships,
        boards,
      },
    });

    return exits.success(projectMembership);
  },
};
