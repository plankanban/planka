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
    const task = await Task.findOne(inputs.criteria);

    if (!task) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers
      .getCardToProjectPath(task.cardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          task,
          ...nodes,
        },
      }));

    return exits.success({
      task,
      ...path,
    });
  },
};
