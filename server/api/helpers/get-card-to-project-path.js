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
    const card = await Card.findOne(inputs.criteria);

    if (!card) {
      throw 'notFound';
    }

    const path = await sails.helpers
      .getListToProjectPath(card.listId)
      .intercept('notFound', path => ({
        notFound: {
          card,
          ...path
        }
      }));

    return exits.success({
      card,
      ...path
    });
  }
};
