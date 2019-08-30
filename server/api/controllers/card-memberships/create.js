const Errors = {
  CARD_NOT_FOUND: {
    notFound: 'Card is not found'
  },
  USER_NOT_FOUND: {
    notFound: 'User is not found'
  },
  CARD_MEMBERSHIP_EXIST: {
    conflict: 'Card membership is already exist'
  }
};

module.exports = {
  inputs: {
    cardId: {
      type: 'number',
      required: true
    },
    userId: {
      type: 'number',
      required: true
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    },
    conflict: {
      responseType: 'conflict'
    }
  },

  fn: async function(inputs, exits) {
    const { currentUser } = this.req;

    const { card, project } = await sails.helpers
      .getCardToProjectPath(inputs.cardId)
      .intercept('notFound', () => Errors.CARD_NOT_FOUND);

    let isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      inputs.userId
    );

    if (!isUserMemberForProject) {
      throw Errors.USER_NOT_FOUND;
    }

    const cardMembership = await sails.helpers
      .createCardMembership(card, inputs.userId, this.req)
      .intercept('conflict', () => Errors.CARD_MEMBERSHIP_EXIST);

    return exits.success({
      item: cardMembership
    });
  }
};
