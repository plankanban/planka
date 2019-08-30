module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      required: true
    }
  },

  exits: {
    notFound: {}
  },

  fn: async function(inputs, exits) {
    const task = await Task.findOne(inputs.criteria);

    if (!task) {
      throw 'notFound';
    }

    const path = await sails.helpers
      .getCardToProjectPath(task.cardId)
      .intercept('notFound', path => ({
        notFound: {
          task,
          ...path
        }
      }));

    return exits.success({
      task,
      ...path
    });
  }
};
