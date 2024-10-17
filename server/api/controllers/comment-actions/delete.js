const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  COMMENT_ACTION_NOT_FOUND: {
    commentActionNotFound: 'Comment action not found',
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
    commentActionNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.actions
      .getProjectPath({
        id: inputs.id,
        type: Action.Types.COMMENT_CARD,
      })
      .intercept('pathNotFound', () => Errors.COMMENT_ACTION_NOT_FOUND);

    let { action } = path;
    const { card, list, board, project } = path;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      if (action.userId !== currentUser.id) {
        throw Errors.COMMENT_ACTION_NOT_FOUND; // Forbidden
      }

      const boardMembership = await BoardMembership.findOne({
        boardId: board.id,
        userId: currentUser.id,
      });

      if (!boardMembership) {
        throw Errors.COMMENT_ACTION_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR && !boardMembership.canComment) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    action = await sails.helpers.actions.deleteOne.with({
      project,
      board,
      list,
      card,
      record: action,
      actorUser: currentUser,
      request: this.req,
    });

    if (!action) {
      throw Errors.COMMENT_ACTION_NOT_FOUND;
    }

    return {
      item: action,
    };
  },
};
