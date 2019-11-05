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
    const card = await Card.findOne(inputs.criteria);

    if (!card) {
      throw 'notFound';
    }

    const path = await sails.helpers
      .getListToProjectPath(card.listId)
      .intercept('notFound', (nodes) => ({
        notFound: {
          card,
          ...nodes,
        },
      }));

    return exits.success({
      card,
      ...path,
    });
  },
};
