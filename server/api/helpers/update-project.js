module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true
    },
    values: {
      type: 'json',
      required: true
    },
    request: {
      type: 'ref'
    }
  },

  fn: async function(inputs, exits) {
    const project = await Project.updateOne(inputs.record.id).set(
      inputs.values
    );

    if (project) {
      const userIds = await sails.helpers.getMembershipUserIdsForProject(
        project.id
      );

      userIds.forEach(userId => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectUpdate',
          {
            item: project
          },
          inputs.request
        );
      });
    }

    return exits.success(project);
  }
};
