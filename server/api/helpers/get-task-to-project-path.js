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
    const task = await Task.findOne(inputs.criteria);

    if (!task) {
      throw 'notFound';
    }

    const path = await sails.helpers
      .getCardToProjectPath(task.cardId)
      .intercept('notFound', nodes => ({
        notFound: {
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
