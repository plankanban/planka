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
    const action = await Action.findOne(inputs.criteria);

    if (!action) {
      throw 'notFound';
    }

    const path = await sails.helpers
      .getCardToProjectPath(action.cardId)
      .intercept('notFound', path => ({
        notFound: {
          action,
          ...path
        }
      }));

    return exits.success({
      action,
      ...path
    });
  }
};
