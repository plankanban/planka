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
    const card = await Card.findOne(inputs.criteria);

    if (!card) {
      throw 'pathNotFound';
    }

    let path;
    if (card.listId) {
      path = await sails.helpers.lists
        .getProjectPath(card.listId)
        .intercept('pathNotFound', (nodes) => ({
          pathNotFound: {
            card,
            ...nodes,
          },
        }));
    } else {
      path = await sails.helpers.boards
        .getProjectPath(card.boardId)
        .intercept('pathNotFound', (nodes) => ({
          pathNotFound: {
            card,
            ...nodes,
          },
        }));
    }

    return {
      card,
      ...path,
    };
  },
};
