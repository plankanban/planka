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

  async fn(inputs, exits) {
    // TODO: allow over HTTP without subscription
    if (!this.req.isSocket) {
      return this.res.badRequest();
    }

    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const values = _.pick(inputs, ['position', 'name']);

    const board = await sails.helpers.createBoard(project, values, this.req);

    sails.sockets.join(this.req, `board:${board.id}`); // TODO: only when subscription needed

    return exits.success({
      item: board,
      included: {
        lists: [],
        labels: [],
      },
    });
  },
};
