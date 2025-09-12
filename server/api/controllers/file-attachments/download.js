/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  FILE_ATTACHMENT_NOT_FOUND: {
    fileAttachmentNotFound: 'File attachment not found',
  },
};

const INLINE_MIME_TYPES_SET = new Set([
  'application/pdf',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/opus',
  'audio/mp4',
  'audio/x-aac',
  'video/mp4',
  'video/ogg',
  'video/webm',
]);

module.exports = {
  inputs: {
    id: {
      ...idInput,
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
        `${sails.config.custom.attachmentsPathSegment}/${attachment.data.uploadedFileId}/${attachment.data.filename}`,
      );
    } catch (error) {
      throw Errors.FILE_ATTACHMENT_NOT_FOUND;
    }

    if (attachment.data.mimeType) {
      this.res.type(attachment.data.mimeType);
    }
    if (!INLINE_MIME_TYPES_SET.has(attachment.data.mimeType) && !attachment.data.image) {
      this.res.set('Content-Disposition', 'attachment');
    }
    this.res.set('Cache-Control', 'private, max-age=900'); // TODO: move to config

    return exits.success(readStream);
  },
};
