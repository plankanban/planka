const util = require('util');
const { v4: uuid } = require('uuid');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  NO_IMPORT_FILE_WAS_UPLOADED: {
    noImportFileWasUploaded: 'No import file was uploaded',
  },
  INVALID_IMPORT_FILE: {
    invalidImportFile: 'Invalid import file',
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
    importType: {
      type: 'string',
      isIn: Object.values(Board.ImportTypes),
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    noImportFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
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
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['position', 'name']);

    let boardImport;
    if (inputs.importType && Object.values(Board.ImportTypes).includes(inputs.importType)) {
      const upload = util.promisify((options, callback) =>
        this.req.file('importFile').upload(options, (error, files) => callback(error, files)),
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

      if (files.length === 0) {
        throw Errors.NO_IMPORT_FILE_WAS_UPLOADED;
      }

      const file = _.last(files);

      if (inputs.importType === Board.ImportTypes.TRELLO) {
        boardImport = {
          type: inputs.importType,
          board: await sails.helpers.boards.processUploadedTrelloImportFile(file),
        };
      }
    }

    const { board, boardMembership } = await sails.helpers.boards.createOne.with({
      values: {
        ...values,
        project,
      },
      import: boardImport,
      actorUser: currentUser,
      requestId: inputs.requestId,
      request: this.req,
    });

    return {
      item: board,
      included: {
        boardMemberships: [boardMembership],
      },
    };
  },
};
