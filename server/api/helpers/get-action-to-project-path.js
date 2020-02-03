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
    const action = await Action.findOne(inputs.criteria);

    if (!action) {
      throw 'notFound';
    }

    const path = await sails.helpers
      .getCardToProjectPath(action.cardId)
      .intercept('notFound', nodes => ({
        notFound: {
          action,
          ...nodes,
        },
      }));

    return exits.success({
      action,
      ...path,
    });
  },
};
