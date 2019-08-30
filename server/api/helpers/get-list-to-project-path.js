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
    const list = await List.findOne(inputs.criteria);

    if (!list) {
      throw 'notFound';
    }

    const path = await sails.helpers
      .getBoardToProjectPath(list.boardId)
      .intercept('notFound', path => ({
        notFound: {
          list,
          ...path
        }
      }));

    return exits.success({
      list,
      ...path
    });
  }
};
