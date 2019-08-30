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
    const label = await Label.findOne(inputs.criteria);

    if (!label) {
      throw 'notFound';
    }

    const path = await sails.helpers
      .getBoardToProjectPath(label.boardId)
      .intercept('notFound', path => ({
        notFound: {
          label,
          ...path
        }
      }));

    return exits.success({
      label,
      ...path
    });
  }
};
