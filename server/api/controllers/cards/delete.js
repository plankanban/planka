const Errors = {
  CARD_NOT_FOUND: {
    notFound: 'Card is not found'
  }
};

module.exports = {
  inputs: {
    id: {
      type: 'number',
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

    let { card, project } = await sails.helpers
      .getCardToProjectPath(inputs.id)
      .intercept('notFound', () => Errors.CARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    card = await sails.helpers.deleteCard(card, this.req);

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    return exits.success({
      item: card
    });
  }
};
