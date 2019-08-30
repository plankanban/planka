const Errors = {
  CARD_NOT_FOUND: {
    notFound: 'Card is not found'
  }
};

module.exports = {
  inputs: {
    cardId: {
      type: 'number',
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    isCompleted: {
      type: 'boolean'
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function(inputs, exits) {
    const { currentUser } = this.req;

    const { card, project } = await sails.helpers
      .getCardToProjectPath(inputs.cardId)
      .intercept('notFound', () => Errors.CARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['name', 'isCompleted']);

    const task = await sails.helpers.createTask(card, values, this.req);

    return exits.success({
      item: task
    });
  }
};
