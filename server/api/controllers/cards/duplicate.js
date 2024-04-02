const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card } = await sails.helpers.cards
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: card.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const { board, list } = await sails.helpers.lists
      .getProjectPath(card.listId)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const values = _.pick(card, ['position', 'name', 'description', 'dueDate', 'stopwatch']);

    const newCard = await sails.helpers.cards.createOne
      .with({
        board,
        values: {
          ...values,
          name: `${card.name} (copy)`,
          list,
          creatorUser: currentUser,
        },
        request: this.req,
      })
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT);

    const tasks = await sails.helpers.cards.getTasks(inputs.id);

    const newTasks = await Promise.all(
      tasks.map(async (task) => {
        const taskValues = _.pick(task, ['position', 'name', 'isCompleted']);
        const newTask = await sails.helpers.tasks.createOne.with({
          values: {
            ...taskValues,
            card: newCard,
          },
          request: this.req,
        });
        return newTask;
      }),
    );

    // TODO: add labels
    return {
      item: newCard,
      included: {
        tasks: newTasks,
      },
    };
  },
};
