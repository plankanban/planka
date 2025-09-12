/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/background-images:
 *   post:
 *     summary: Upload background image
 *     description: Uploads a background image for a project. Requires project manager permissions.
 *     tags:
 *       - Background Images
 *     operationId: createBackgroundImage
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project to upload background image for
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Background image file (must be an image format)
 *               requestId:
 *                 type: string
 *                 maxLength: 128
 *                 description: Request ID for tracking
 *                 example: req_123456
 *     responses:
 *       200:
 *         description: Background image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BackgroundImage'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         description: File upload error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - code
 *                 - message
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Error code
 *                   example: E_UNPROCESSABLE_ENTITY
 *                 message:
 *                   type: string
 *                   enum:
 *                     - No file was uploaded
 *                     - File is not image
 *                   description: Specific error message
 *                   example: No file was uploaded
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
