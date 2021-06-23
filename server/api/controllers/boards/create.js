const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    type: {
      type: 'string',
      isIn: Object.values(Board.Types),
      required: true,
    },
    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    // TODO: allow over HTTP without subscription
    if (!this.req.isSocket) {
      return this.res.badRequest();
    }

    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['type', 'position', 'name']);

    const { board, boardMembership } = await sails.helpers.boards.createOne(
      values,
      currentUser,
      project,
      this.req,
    );

    sails.sockets.join(this.req, `board:${board.id}`); // TODO: only when subscription needed

    return {
      item: board,
      included: {
        boardMemberships: [boardMembership],
      },
    };
  },
};
