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
    const list = await List.findOne(inputs.criteria);

    if (!list) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers.boards
      .getProjectPath(list.boardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          list,
          ...nodes,
        },
      }));

    return {
      list,
      ...path,
    };
  },
};
