const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  USER_NOT_CARD_MEMBER: {
    userNotCardMember: 'User not card member',
  },
};

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
    userNotCardMember: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers
      .getCardToProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    let cardMembership = await CardMembership.findOne({
      cardId: inputs.cardId,
      userId: inputs.userId,
    });

    if (!cardMembership) {
      throw Errors.USER_NOT_CARD_MEMBER;
    }

    cardMembership = await sails.helpers.deleteCardMembership(cardMembership, board, this.req);

    if (!cardMembership) {
      throw Errors.USER_NOT_CARD_MEMBER;
    }

    return exits.success({
      item: cardMembership,
    });
  },
};
