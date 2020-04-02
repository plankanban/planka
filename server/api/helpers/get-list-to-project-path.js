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

  async fn(inputs, exits) {
    const list = await List.findOne(inputs.criteria);

    if (!list) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers
      .getBoardToProjectPath(list.boardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          list,
          ...nodes,
        },
      }));

    return exits.success({
      list,
      ...path,
    });
  },
};
