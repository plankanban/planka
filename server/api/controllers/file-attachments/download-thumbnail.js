/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /attachments/{id}/download/thumbnails/{fileName}.{fileExtension}:
 *   get:
 *     summary: Download file attachment thumbnail
 *     description: Downloads a thumbnail for a file attachment. Only available for image attachments that have thumbnails generated. Requires access to the card.
 *     tags:
 *       - File Attachments
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the file attachment to download the thumbnail for
 *         schema:
 *           type: string
 *           example: 1357158568008091264
 *       - name: fileName
 *         in: path
 *         required: true
 *         description: Thumbnail size identifier
 *         schema:
 *           type: string
 *           enum: [outside-360, outside-720]
 *           example: outside-360
 *       - name: fileExtension
 *         in: path
 *         required: true
 *         description: File extension of the thumbnail
 *         schema:
 *           type: string
 *           example: jpg
 *     responses:
 *       200:
 *         description: Thumbnail image returned successfully
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *             description: MIME type of the thumbnail image
 *           Cache-Control:
 *             schema:
 *               type: string
 *             description: Cache control header
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  FILE_ATTACHMENT_NOT_FOUND: {
    fileAttachmentNotFound: 'File attachment not found',
  },
};

const FILE_NAMES = ['outside-360', 'outside-720'];

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    fileName: {
      type: 'string',
      isIn: FILE_NAMES,
      required: true,
    },
    fileExtension: {
      type: 'string',
      maxLength: 128, // TODO: unnecessary?
      required: true,
    },
  },

  exits: {
    fileAttachmentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { attachment, board, project } = await sails.helpers.attachments
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.FILE_ATTACHMENT_NOT_FOUND);

    if (attachment.type !== Attachment.Types.FILE) {
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    if (!attachment.data.image) {
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    if (inputs.fileExtension !== attachment.data.image.thumbnailsExtension) {
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          board.id,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.FILE_ATTACHMENT_NOT_FOUND; // Forbidden
        }
      }
    }

    const fileManager = sails.hooks['file-manager'].getInstance();

    let readStream;
    try {
      readStream = await fileManager.read(
        `${sails.config.custom.attachmentsPathSegment}/${attachment.data.uploadedFileId}/thumbnails/${inputs.fileName}.${inputs.fileExtension}`,
      );
    } catch (error) {
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    this.res.type(attachment.data.mimeType);
    this.res.set('Cache-Control', 'private, max-age=900'); // TODO: move to config

    return exits.success(readStream);
  },
};
