const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    type: {
      type: 'string',
      isIn: Object.values(List.SortTypes),
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, board, project } = await sails.helpers.lists
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.LIST_NOT_FOUND;
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const cards = await sails.helpers.lists.sortOne.with({
      project,
      board,
      record: list,
      type: inputs.type,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: list,
      included: {
        cards,
      },
    };
  },
};
