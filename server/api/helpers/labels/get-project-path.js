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
    const label = await Label.findOne(inputs.criteria);

    if (!label) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers.boards
      .getProjectPath(label.boardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          label,
          ...nodes,
        },
      }));

    return {
      label,
      ...path,
    };
  },
};
