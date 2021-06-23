module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const boardMembership = await BoardMembership.findOne(inputs.criteria);

    if (!boardMembership) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers.boards
      .getProjectPath(boardMembership.boardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          boardMembership,
          ...nodes,
        },
      }));

    return {
      boardMembership,
      ...path,
    };
  },
};
