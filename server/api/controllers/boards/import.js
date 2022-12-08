const util = require('util');
const { v4: uuid } = require('uuid');

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

  async fn(inputs) {
    const { currentUser } = this.req;

    const upload = util.promisify((options, callback) =>
      this.req.file('file').upload(options, (error, files) => callback(error, files)),
    );

    let files;
    try {
      files = await upload({
        saveAs: uuid(),
        maxBytes: null,
      });
    } catch (error) {
      return exits.uploadError(error.message); // TODO: add error
    }

    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    const values = {
      ..._.pick(inputs, ['position', 'name']),
      type: 'kanban',
    };

    const { board, boardMembership } = await sails.helpers.boards.createOne(
      values,
      currentUser,
      project,
      this.req,
    );

    await sails.helpers.boards.importTrello(currentUser, board, files[0], this.req);

    if (this.req.isSocket) {
      sails.sockets.join(this.req, `board:${board.id}`); // TODO: only when subscription needed
    }

    return {
      item: board,
      included: {
        boardMemberships: [boardMembership],
      },
    };
  },
};
