module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: (value) =>
        _.isPlainObject(value) && (_.isUndefined(value.position) || _.isFinite(value.position)),
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs, exits) {
    const userIds = await sails.helpers.getMembershipUserIdsForProject(inputs.record.projectId);

    if (!_.isUndefined(inputs.values.position)) {
      const boards = await sails.helpers.getBoardsForProject(
        inputs.record.projectId,
        inputs.record.id,
      );

      const { position, repositions } = sails.helpers.insertToPositionables(
        inputs.values.position,
        boards,
      );

      inputs.values.position = position; // eslint-disable-line no-param-reassign

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await Board.update({
          id,
          projectId: inputs.record.projectId,
        }).set({
          position: nextPosition,
        });

        userIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
            item: {
              id,
              position: nextPosition,
            },
          });
        });
      });
    }

    const board = await Board.updateOne(inputs.record.id).set(inputs.values);

    if (board) {
      userIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'boardUpdate',
          {
            item: board,
          },
          inputs.request,
        );
      });
    }

    return exits.success(board);
  },
};
