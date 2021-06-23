module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: (value) => {
        if (!_.isPlainObject(value)) {
          return false;
        }

        if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
          return false;
        }

        return true;
      },
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const userIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(
      inputs.record.projectId,
    );

    if (!_.isUndefined(inputs.values.position)) {
      const boards = await sails.helpers.projects.getBoards(
        inputs.record.projectId,
        inputs.record.id,
      );

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
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

    return board;
  },
};
