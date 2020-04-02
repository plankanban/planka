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
    const label = await Label.findOne(inputs.criteria);

    if (!label) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers
      .getBoardToProjectPath(label.boardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          label,
          ...nodes,
        },
      }));

    return exits.success({
      label,
      ...path,
    });
  },
};
