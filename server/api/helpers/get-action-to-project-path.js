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
    const action = await Action.findOne(inputs.criteria);

    if (!action) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers
      .getCardToProjectPath(action.cardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
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
