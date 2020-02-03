module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs, exits) {
    await ProjectMembership.destroy({
      userId: inputs.record.id,
    });

    await CardSubscription.destroy({
      userId: inputs.record.id,
    });

    await CardMembership.destroy({
      userId: inputs.record.id,
    });

    const user = await User.updateOne({
      id: inputs.record.id,
      deletedAt: null,
    }).set({
      deletedAt: new Date().toUTCString(),
    });

    if (user) {
      const adminUserIds = await sails.helpers.getAdminUserIds();

      const projectIds = await sails.helpers.getMembershipProjectIdsForUser(user.id);

      const userIdsForProject = await sails.helpers.getMembershipUserIdsForProject(projectIds);

      const userIds = _.union([user.id], adminUserIds, userIdsForProject);

      userIds.forEach(userId => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'userDelete',
          {
            item: user,
          },
          inputs.request,
        );
      });
    }

    return exits.success(user);
  },
};
