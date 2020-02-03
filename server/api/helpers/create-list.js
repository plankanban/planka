module.exports = {
  inputs: {
    board: {
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
    const lists = await sails.helpers.getListsForBoard(inputs.board.id);

    const { position, repositions } = sails.helpers.insertToPositionables(
      inputs.values.position,
      lists,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await List.update({
        id,
        boardId: inputs.board.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${inputs.board.id}`, 'listUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const list = await List.create({
      ...inputs.values,
      position,
      boardId: inputs.board.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${list.boardId}`,
      'listCreate',
      {
        item: list,
      },
      inputs.request,
    );

    return exits.success(list);
  },
};
