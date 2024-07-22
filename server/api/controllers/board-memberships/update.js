const Errors = {
  BOARD_MEMBERSHIP_NOT_FOUND: {
    boardMembershipNotFound: 'Board membership not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(BoardMembership.Roles),
    },
    canComment: {
      type: 'boolean',
      allowNull: true,
    },
  },

  exits: {
    boardMembershipNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.boardMemberships
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_MEMBERSHIP_NOT_FOUND);

    let { boardMembership } = path;
    const { board, project } = path;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.BOARD_MEMBERSHIP_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['role', 'canComment']);

    boardMembership = await sails.helpers.boardMemberships.updateOne.with({
      values,
      project,
      board,
      record: boardMembership,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: boardMembership,
    };
  },
};
