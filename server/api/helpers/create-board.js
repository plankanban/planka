module.exports = {
  inputs: {
    project: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: value => _.isPlainObject(value) && _.isFinite(value.position),
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs, exits) {
    const boards = await sails.helpers.getBoardsForProject(inputs.project.id);

    const { position, repositions } = sails.helpers.insertToPositionables(
      inputs.values.position,
      boards,
    );

    const userIds = await sails.helpers.getMembershipUserIdsForProject(inputs.project.id);

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Board.update({
        id,
        projectId: inputs.project.id,
      }).set({
        position: nextPosition,
      });

      userIds.forEach(userId => {
        sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    });

    const board = await Board.create({
      ...inputs.values,
      position,
      projectId: inputs.project.id,
    }).fetch();

    userIds.forEach(userId => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'boardCreate',
        {
          item: board,
          included: {
            lists: [],
            labels: [],
          },
        },
        inputs.request,
      );
    });

    return exits.success(board);
  },
};
