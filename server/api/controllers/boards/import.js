const util = require('util');
const { v4: uuid } = require('uuid');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  TRELLO_FILE_INVALID: {
    trelloFileInvalid: 'Trello File invalid',
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
    trelloFileInvalid: {
      responseType: 'badRequest',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId);
    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);
    if (!isProjectManager) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const upload = util.promisify((options, callback) =>
      this.req.file('file').upload(options, (error, files) => callback(error, files)),
    );

    let files;
    let trelloBoard;
    try {
      files = await upload({
        saveAs: uuid(),
        maxBytes: null,
      });
      trelloBoard = await sails.helpers.boards.loadTrelloFile(files[0]);
    } catch (error) {
      throw Errors.TRELLO_FILE_INVALID;
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

    await sails.helpers.boards.importTrello(currentUser, board, trelloBoard, this.req);

    if (this.req.isSocket) {
      sails.sockets.join(this.req, `board:${board.id}`);
    }

    return {
      item: board,
      included: {
        boardMemberships: [boardMembership],
      },
    };
  },
};
