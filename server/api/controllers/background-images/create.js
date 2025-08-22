/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

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
    projectId: {
      ...idInput,
      required: true,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
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

    const project = await Project.qm.getOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    let files;
    try {
      files = await sails.helpers.utils.receiveFile(this.req.file('file'));
    } catch (error) {
      return exits.uploadError(error.message); // TODO: add error
    }

    if (files.length === 0) {
      throw Errors.NO_FILE_WAS_UPLOADED;
    }

    const file = _.last(files);

    const values = await sails.helpers.backgroundImages
      .processUploadedFile(file)
      .intercept('fileIsNotImage', () => Errors.FILE_IS_NOT_IMAGE);

    const backgroundImage = await sails.helpers.backgroundImages.createOne.with({
      values: {
        ...values,
        project,
      },
      actorUser: currentUser,
      requestId: inputs.requestId,
      request: this.req,
    });

    return exits.success({
      item: sails.helpers.backgroundImages.presentOne(backgroundImage),
    });
  },
};
