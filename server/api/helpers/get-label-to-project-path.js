module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    notFound: {},
  },

  async fn(inputs, exits) {
    const label = await Label.findOne(inputs.criteria);

    if (!label) {
      throw 'notFound';
    }

    const path = await sails.helpers
      .getBoardToProjectPath(label.boardId)
      .intercept('notFound', (nodes) => ({
        notFound: {
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
