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
    const list = await List.findOne(inputs.criteria);

    if (!list) {
      throw 'notFound';
    }

    const path = await sails.helpers
      .getBoardToProjectPath(list.boardId)
      .intercept('notFound', (nodes) => ({
        notFound: {
          list,
          ...nodes,
        },
      }));

    return exits.success({
      list,
      ...path,
    });
  },
};
