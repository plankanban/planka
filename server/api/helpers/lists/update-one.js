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
    if (!_.isUndefined(inputs.values.position)) {
      const lists = await sails.helpers.boards.getLists(inputs.record.boardId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        inputs.values.position,
        lists,
      );

      inputs.values.position = position; // eslint-disable-line no-param-reassign

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await List.update({
          id,
          boardId: inputs.record.boardId,
        }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`board:${inputs.record.boardId}`, 'listUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    }

    const list = await List.updateOne(inputs.record.id).set(inputs.values);

    if (list) {
      sails.sockets.broadcast(
        `board:${list.boardId}`,
        'listUpdate',
        {
          item: list,
        },
        inputs.request,
      );
    }

    return list;
  },
};
