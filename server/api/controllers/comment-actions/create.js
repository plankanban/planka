const Errors = {
  CARD_NOT_FOUND: {
    notFound: 'Card is not found'
  }
};

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true
    },
    text: {
      type: 'string',
      required: true
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

    const values = {
      type: 'commentCard',
      data: _.pick(inputs, ['text'])
    };

    const action = await sails.helpers.createAction(card, currentUser, values);

    return exits.success({
      item: action
    });
  }
};
