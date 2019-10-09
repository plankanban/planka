const Errors = {
  BOARD_NOT_FOUND: {
    notFound: 'Board is not found'
  }
};

module.exports = {
  inputs: {
    boardId: {
      type: 'number',
      required: true
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
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

    const { board, project } = await sails.helpers
      .getBoardToProjectPath(inputs.boardId)
      .intercept('notFound', () => Errors.BOARD_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['name', 'color']);

    const label = await sails.helpers.createLabel(board, values, this.req);

    return exits.success({
      item: label
    });
  }
};
