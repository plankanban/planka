const util = require('util');
const rimraf = require('rimraf');
const { v4: uuid } = require('uuid');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  NO_FILE_WAS_UPLOADED: {
    noFileWasUploaded: 'No file was uploaded',
  },
  FILE_IS_NOT_IMAGE: {
    fileIsNotImage: 'File is not image',
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
    projectNotFound: {
      responseType: 'notFound',
    },
    noFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    fileIsNotImage: {
      responseType: 'unprocessableEntity',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    let project = await Project.findOne(inputs.id);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

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

    if (files.length === 0) {
      throw Errors.NO_FILE_WAS_UPLOADED;
    }

    const file = _.last(files);

    const fileData = await sails.helpers.projects
      .processUploadedBackgroundImageFile(file)
      .intercept('fileIsNotImage', () => {
        try {
          rimraf.sync(file.fd);
        } catch (error) {
          console.warn(error.stack); // eslint-disable-line no-console
        }

        return Errors.FILE_IS_NOT_IMAGE;
      });

    project = await sails.helpers.projects.updateOne.with({
      record: project,
      values: {
        backgroundImage: fileData,
      },
      actorUser: currentUser,
      request: this.req,
    });

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    return exits.success({
      item: project,
    });
  },
};
