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
    const action = await Action.findOne(inputs.criteria);

    if (!action) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers.cards
      .getProjectPath(action.cardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          action,
          ...nodes,
        },
      }));

    return {
      action,
      ...path,
    };
  },
};
