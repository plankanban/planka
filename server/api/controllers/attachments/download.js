const fs = require('fs');
const path = require('path');

const Errors = {
  ATTACHMENT_NOT_FOUND: {
    attachmentNotFound: 'Attachment not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    filename: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    attachmentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { attachment, card, project } = await sails.helpers.attachments
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.ATTACHMENT_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, card.boardId);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.ATTACHMENT_NOT_FOUND; // Forbidden
      }
    }

    const filePath = path.join(
      sails.config.custom.attachmentsPath,
      attachment.dirname,
      attachment.filename,
    );

    if (!fs.existsSync(filePath)) {
      throw Errors.ATTACHMENT_NOT_FOUND;
    }

    let contentDisposition;
    if (attachment.isImage || path.extname(attachment.filename) === '.pdf') {
      contentDisposition = 'inline';
    } else {
      contentDisposition = `attachment; ${inputs.filename}`;
    }

    this.res.setHeader('Content-Disposition', contentDisposition);
    return exits.success(fs.createReadStream(filePath));
  },
};
