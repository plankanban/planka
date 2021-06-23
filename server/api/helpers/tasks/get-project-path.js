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
    const task = await Task.findOne(inputs.criteria);

    if (!task) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers.cards
      .getProjectPath(task.cardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          task,
          ...nodes,
        },
      }));

    return {
      task,
      ...path,
    };
  },
};
